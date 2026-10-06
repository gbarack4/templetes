"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { SiteLoader } from "./SiteLoader";

const SIGN_IN_HOLD_MS = 2000;

type SignInTransitionContextValue = Readonly<{
  begin: (redirectPath: string) => void;
  cancel: () => void;
}>;

const SignInTransitionContext =
  createContext<SignInTransitionContextValue | null>(null);

export function useSignInTransition() {
  const value = useContext(SignInTransitionContext);
  if (!value) {
    throw new Error("useSignInTransition requires SignInTransition");
  }
  return value;
}

function pathnameOf(redirectPath: string) {
  try {
    return new URL(redirectPath, "http://local").pathname;
  } catch {
    return "/dashboard";
  }
}

export function SignInTransition({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const auth = useAuth();
  const pathname = usePathname();
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const deadlineRef = useRef(0);

  const begin = useCallback((redirectPath: string) => {
    deadlineRef.current = Date.now() + SIGN_IN_HOLD_MS;
    setTargetPath(pathnameOf(redirectPath));
  }, []);

  const cancel = useCallback(() => {
    setTargetPath(null);
  }, []);

if (targetPath !== null && !auth.isSignedIn && auth.profileRequired) {
  setTargetPath(null);
}

  useEffect(() => {
    if (!targetPath || !auth.isSignedIn || pathname !== targetPath) return;
    const remaining = deadlineRef.current - Date.now();
    const timeoutId = window.setTimeout(
      () => setTargetPath(null),
      Math.max(remaining, 0),
    );
    return () => window.clearTimeout(timeoutId);
  }, [auth.isSignedIn, pathname, targetPath]);

  useEffect(() => {
    if (!targetPath) return;
    document.body.classList.add("site-is-loading");
    return () => document.body.classList.remove("site-is-loading");
  }, [targetPath]);

  return (
    <SignInTransitionContext.Provider value={{ begin, cancel }}>
      {targetPath ? <SiteLoader label="Signing in" /> : null}
      <div
        className={`flex min-h-0 flex-1 flex-col ${targetPath ? "invisible" : ""}`}
        aria-hidden={targetPath ? true : undefined}
      >
        {children}
      </div>
    </SignInTransitionContext.Provider>
  );
}
