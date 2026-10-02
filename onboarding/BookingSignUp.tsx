"use client";

import { usePathname, useRouter } from "next/navigation";
import { FlowPageHeader } from "@/dashboard/components/FlowPageHeader";
import { AuthForm } from "@/lib/auth/AuthForm";

export function BookingSignUp({
  onBack,
  onComplete,
  onSignIn,
  description = "Create an account to finish booking your lesson.",
}: Readonly<{
  onBack: () => void;
  onComplete: () => void;
  onSignIn?: () => void;
  description?: string;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  function openSignIn() {
    if (onSignIn) {
      onSignIn();
      return;
    }
    const embedBase = /^\/embed\/[^/]+/.exec(pathname)?.[0];
    const login = embedBase ? `${embedBase}/sign-in` : "/login";
    const redirect = `${window.location.pathname}${window.location.search}`;
    router.push(`${login}?redirect_url=${encodeURIComponent(redirect)}`);
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <FlowPageHeader title="Create account" onBack={onBack} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-8 pt-6">
        <p className="mb-4 text-sm text-slate-600">{description}</p>
        <AuthForm mode="sign-up" onComplete={onComplete} />
        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={openSignIn}
            className="font-medium text-blue-600"
          >
            Sign in
          </button>
        </p>
      </main>
    </div>
  );
}
