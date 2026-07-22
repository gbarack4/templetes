"use client";

import { useState } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { FlowPageHeader } from "@/dashboard/components/FlowPageHeader";
import { useSchoolId } from "@/dashboard/SchoolContext";

type BookingSignUpProps = Readonly<{
  onBack: () => void;
  onComplete: () => void;
  description?: string;
}>;

export function BookingSignUp({
  onBack,
  onComplete,
  description = "Create an account to finish booking your lesson.",
}: BookingSignUpProps) {
  const clerk = useClerk();
  const schoolId = useSchoolId();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length >= 6 &&
    !isSubmitting;

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !clerk.loaded) return;

    setIsSubmitting(true);
    setError("");

    try {
      await clerk.client.signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
        unsafeMetadata: {
          phone_number: phone,
          schoolId: schoolId,
        },
      });

      await clerk.client.signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setPendingVerification(true);
    } catch (err: unknown) {
      console.error(err);
      const clerkError = err as { errors?: Array<{ longMessage?: string }> };
      setError(
        clerkError.errors?.[0]?.longMessage ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code || !clerk.loaded) return;

    setIsSubmitting(true);
    setError("");

    try {
      const completeSignUp =
        await clerk.client.signUp.attemptEmailAddressVerification({
          code,
        });

      if (completeSignUp.status === "complete") {
        await clerk.setActive({ session: completeSignUp.createdSessionId });
        onComplete();
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error(err);
      const clerkError = err as { errors?: Array<{ longMessage?: string }> };
      setError(
        clerkError.errors?.[0]?.longMessage || "Invalid verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pendingVerification) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <FlowPageHeader
          title="Verify Email"
          onBack={() => setPendingVerification(false)}
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-8 pt-6">
          <p className="mb-6 text-sm text-slate-500">
            We sent a verification code to{" "}
            <span className="font-medium text-slate-900">{email}</span>.
          </p>

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="code"
                className="text-sm font-medium text-slate-900"
              >
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || code.length < 6}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {isSubmitting ? "Verifying..." : "Verify & Complete"}
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <FlowPageHeader title="Create account" onBack={onBack} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 pb-8 pt-6 [-webkit-overflow-scrolling:touch]">
        <p className="mb-4 text-sm text-slate-500">{description}</p>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="first-name"
                className="text-sm font-medium text-slate-900"
              >
                First name
              </label>
              <input
                id="first-name"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="last-name"
                className="text-sm font-medium text-slate-900"
              >
                Last name
              </label>
              <input
                id="last-name"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-email"
              className="text-sm font-medium text-slate-900"
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-phone"
              className="text-sm font-medium text-slate-900"
            >
              Phone
            </label>
            <input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-password"
              className="text-sm font-medium text-slate-900"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
