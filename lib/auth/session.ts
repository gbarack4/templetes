import { authErrorMessage, errorName } from "./errors";
import type { SessionTokens, StudentProfileInput, SyncResult } from "./types";

export type AuthState = Readonly<{
  isLoaded: boolean;
  hasSession: boolean;
  isSignedIn: boolean;
  userId: string | null;
  profileRequired: boolean;
  error: string | null;
}>;
export const INITIAL_AUTH: AuthState = {
  isLoaded: false,
  hasSession: false,
  isSignedIn: false,
  userId: null,
  profileRequired: false,
  error: null,
};

type Dependencies = {
  clearCache?: () => void;
  signIn: (email: string, password: string) => Promise<SessionTokens>;
  refresh: (token: string) => Promise<SessionTokens>;
  revoke: (token: string) => Promise<void>;
  sync: (tokens: SessionTokens, profile?: StudentProfileInput) => Promise<SyncResult>;
  storage: {
    read: () => string | null;
    write: (token: string) => void;
    remove: () => void;
  };
};

export class StudentSession {
  private state: AuthState = INITIAL_AUTH;
  private tokens: SessionTokens | null = null;
  private generation = 0;
  private syncVersion = 0;
  private refreshFlight: Promise<SessionTokens | null> | null = null;
  private readonly listeners = new Set<() => void>();
  constructor(private readonly deps: Dependencies) {}

  getSnapshot = (): AuthState => this.state;
  getServerSnapshot = (): AuthState => INITIAL_AUTH;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(state: AuthState) {
    this.state = state;
    this.listeners.forEach((listener) => listener());
  }
  private current(generation: number) {
    if (generation !== this.generation)
      throw new DOMException("Session changed", "AbortError");
  }
  // Invalidate pending requests on unmount; keep this school's saved refresh token.
  suspend = () => {
    this.generation++;
    this.tokens = null;
    this.refreshFlight = null;
  };
  private clear() {
    this.deps.clearCache?.();
    this.generation++;
    this.tokens = null;
    this.refreshFlight = null;
    this.deps.storage.remove();
    this.publish({ ...INITIAL_AUTH, isLoaded: true });
  }
  private install(tokens: SessionTokens, generation: number) {
    this.current(generation);
    this.tokens = tokens;
    this.deps.storage.write(tokens.refreshToken);
    this.publish({ ...INITIAL_AUTH, isLoaded: true, hasSession: true });
  }
  private report(error: unknown, generation: number) {
    if (generation === this.generation) {
      this.publish({ ...this.state, isLoaded: true, error: authErrorMessage(error) });
    }
  }

  restore = async (): Promise<void> => {
    const generation = ++this.generation;
    const refreshToken = this.deps.storage.read();
    if (!refreshToken) {
      this.publish({ ...INITIAL_AUTH, isLoaded: true });
      return;
    }
    try {
      const tokens = await this.deps.refresh(refreshToken);
      this.install(tokens, generation);
      await this.syncProfile();
    } catch (error) {
      if (generation !== this.generation) return;
      if (errorName(error) === "NotAuthorizedException") this.clear();
      else this.report(error, generation);
    }
  };

  signIn = async (
    email: string,
    password: string,
    profile?: StudentProfileInput,
  ): Promise<void> => {
    this.clear();
    const generation = this.generation;
    try {
      const tokens = await this.deps.signIn(email, password);
      this.install(tokens, generation);
      await this.syncProfile(profile);
    } catch (error) {
      this.report(error, generation);
      throw error;
    }
  };

  private freshTokens(): Promise<SessionTokens | null> {
    if (!this.tokens) return Promise.resolve(null);
    if (this.tokens.expiresAt > Date.now() + 60_000) return Promise.resolve(this.tokens);
    if (this.refreshFlight) return this.refreshFlight;
    const generation = this.generation;
    const refreshToken = this.tokens.refreshToken;
    const pending = this.deps
      .refresh(refreshToken)
      .then((tokens) => {
        this.current(generation);
        this.tokens = tokens;
        this.deps.storage.write(tokens.refreshToken);
        return tokens;
      })
      .catch((error: unknown) => {
        if (
          generation === this.generation &&
          errorName(error) === "NotAuthorizedException"
        )
          this.clear();
        throw error;
      })
      .finally(() => {
        if (this.refreshFlight === pending) this.refreshFlight = null;
      });
    this.refreshFlight = pending;
    return pending;
  }

  getToken = async (): Promise<string | null> => {
    if (!this.state.isSignedIn) return null;
    const generation = this.generation;
    const tokens = await this.freshTokens();
    this.current(generation);
    return tokens?.accessToken ?? null;
  };

  syncProfile = async (profile?: StudentProfileInput): Promise<void> => {
    const generation = this.generation;
    const syncVersion = ++this.syncVersion;
    try {
      const tokens = await this.freshTokens();
      this.current(generation);
      if (!tokens) throw new Error("Please sign in again.");
      const result = await this.deps.sync(tokens, profile);
      this.current(generation);
      if (syncVersion !== this.syncVersion) return;
      this.publish({
        isLoaded: true,
        hasSession: true,
        isSignedIn: !result.profileRequired && !!result.studentId,
        userId: result.userId,
        profileRequired: result.profileRequired,
        error: null,
      });
    } catch (error) {
      if (syncVersion === this.syncVersion) this.report(error, generation);
      throw error;
    }
  };

  signOut = async (): Promise<void> => {
    const refreshToken = this.tokens?.refreshToken ?? this.deps.storage.read();
    this.clear();
    if (refreshToken) await this.deps.revoke(refreshToken);
  };
}

export function sessionStorageFor(scope: string): Dependencies["storage"] {
  const key = `driveinstructor.student.refresh.v1:${scope}`;
  // Some embedded browsers disallow storage. The current in-memory session still works.
  return {
    read: () => {
      try {
        return window.sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    write: (token) => {
      try {
        window.sessionStorage.setItem(key, token);
      } catch {
        /* Memory-only session. */
      }
    },
    remove: () => {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        /* No saved session. */
      }
    },
  };
}
