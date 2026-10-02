"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AuthForm } from "@/lib/auth/AuthForm";

export function StudentAccessGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (
      auth.isLoaded &&
      !auth.isSignedIn &&
      !auth.hasSession &&
      !auth.error &&
      !auth.configError
    ) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?redirect_url=${encodeURIComponent(redirect)}`);
    }
  }, [
    auth.isLoaded,
    auth.isSignedIn,
    auth.hasSession,
    auth.error,
    auth.configError,
    router,
  ]);
  if (auth.isSignedIn) return children;
  if (auth.isLoaded && (auth.hasSession || auth.error || auth.configError)) {
    return (
      <main className="overflow-y-auto p-6">
        <AuthForm mode="sign-in" onComplete={() => {}} />
      </main>
    );
  }
  return (
    <p role="status" className="p-6 text-sm text-slate-500">
      Loading your account...
    </p>
  );
}
