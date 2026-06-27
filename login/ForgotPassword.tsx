"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlowPageHeader } from "@/dashboard/components/FlowPageHeader";

export function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const canSubmit = email.trim().length > 0 && !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSent(true);
  }

  if (isSent) {
    return (
      <>
        <FlowPageHeader title="Check your email" onBack={() => router.push("/login")} />
        <main className="flex flex-1 flex-col px-5 pb-8 pt-6">
          <p className="text-sm text-slate-500">
            If an account exists for{" "}
            <span className="font-medium text-slate-900">{email}</span>, we sent a
            password reset link. Check your inbox and follow the instructions.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Didn&apos;t receive it? Check spam or{" "}
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              try again
            </button>
            .
          </p>
          <Link
            href="/login"
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to sign in
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <FlowPageHeader title="Forgot password" onBack={() => router.push("/login")} />
      <main className="flex flex-1 flex-col px-5 pb-8 pt-6">
        <p className="mb-6 text-sm text-slate-500">
          Enter the email linked to your account and we&apos;ll send you a link to
          reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="text-sm font-medium text-slate-900">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </main>
    </>
  );
}
