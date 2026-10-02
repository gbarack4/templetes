"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createCognitoClient } from "./cognito.client";
import { INITIAL_AUTH, sessionStorageFor, StudentSession } from "./session";
import { syncStudentSession } from "./student-sync";
import { authScope, type StudentAuthConfig, type StudentProfileInput } from "./types";

function createRuntime(config: StudentAuthConfig, queryClient: QueryClient) {
  const client = createCognitoClient(config);
  const session = new StudentSession({
    ...client,
    clearCache: () => queryClient.clear(),
    storage: sessionStorageFor(authScope(config)),
    sync: (tokens, profile) => syncStudentSession(config.schoolId, tokens, profile),
  });
  return { client, session };
}

type AuthContextValue = typeof INITIAL_AUTH & {
  configError: string | null;
  getToken: () => Promise<string | null>;
  signIn: (
    email: string,
    password: string,
    profile?: StudentProfileInput,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  syncProfile: (profile?: StudentProfileInput) => Promise<void>;
  retry: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  confirm: (email: string, code: string) => Promise<void>;
  resend: (email: string) => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  confirmReset: (email: string, code: string, password: string) => Promise<void>;
  changePassword: (previousPassword: string, proposedPassword: string) => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);
const unavailable = () =>
  Promise.reject(new Error("Sign-in is not available for this school yet."));
const EMPTY_STATE = { ...INITIAL_AUTH, isLoaded: true };
const emptySnapshot = () => EMPTY_STATE;
const emptySubscribe = () => () => {};

export function StudentAuthProvider({
  config,
  error,
  children,
}: Readonly<{
  config: StudentAuthConfig | null;
  error?: string | null;
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 300_000, refetchOnWindowFocus: false } },
      }),
  );
  const [runtime] = useState(() => (config ? createRuntime(config, queryClient) : null));
  const state = useSyncExternalStore(
    runtime?.session.subscribe ?? emptySubscribe,
    runtime?.session.getSnapshot ?? emptySnapshot,
    runtime?.session.getServerSnapshot ?? emptySnapshot,
  );
  useEffect(() => {
    if (!runtime) return;
    void runtime.session.restore();
    return runtime.session.suspend;
  }, [runtime]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      configError: runtime
        ? null
        : error || "Sign-in is not available for this school yet.",
      getToken: runtime?.session.getToken ?? (() => Promise.resolve(null)),
      signIn: runtime?.session.signIn ?? unavailable,
      signOut: runtime?.session.signOut ?? unavailable,
      syncProfile: runtime?.session.syncProfile ?? unavailable,
      retry: runtime
        ? () =>
            runtime.session.getSnapshot().hasSession
              ? runtime.session.syncProfile()
              : runtime.session.restore()
        : unavailable,
      signUp: runtime?.client.signUp ?? unavailable,
      confirm: runtime?.client.confirm ?? unavailable,
      resend: runtime?.client.resend ?? unavailable,
      requestReset: runtime?.client.requestReset ?? unavailable,
      confirmReset: runtime?.client.confirmReset ?? unavailable,
      changePassword: runtime
        ? async (previous, proposed) => {
            const token = await runtime.session.getToken();
            if (!token) throw new Error("Please sign in again.");
            await runtime.client.changePassword(token, previous, proposed);
          }
        : unavailable,
    }),
    [runtime, state, error],
  );

  return (
    <AuthContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth requires a StudentAuthProvider");
  return value;
}
