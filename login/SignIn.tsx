"use client";

import { useEffect, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useSchool } from "@/dashboard/SchoolContext";

import { DrivingSchoolProfile } from "./DrivingSchoolProfile";
import { GoogleIcon } from "@/shared/GoogleIcon";

type SignInProps = Readonly<{
  defaultRedirectUrl?: string;
  signUpHref?: string;
}>;

function getSafeRedirect(
  redirectUrl: string | null,
  fallbackUrl: string,
): string {
  if (!redirectUrl) {
    return fallbackUrl;
  }

  if (!redirectUrl.startsWith("/") || redirectUrl.startsWith("//")) {
    return fallbackUrl;
  }

  return redirectUrl;
}

export function SignIn({
  defaultRedirectUrl = "/dashboard",
  signUpHref = "/sign-up",
}: SignInProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clerk = useClerk();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const school = useSchool();

  const afterSignInUrl = getSafeRedirect(
    searchParams.get("redirect_url"),
    defaultRedirectUrl,
  );

  const isSchoolAccessDenied = searchParams.get("reason") === "school_access";

  const schoolProfile = {
    name: school?.schoolName || "",
    logoUrl: school?.logoUrl || "",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isAuthLoaded && isSignedIn && !isSchoolAccessDenied) {
      router.push(afterSignInUrl);
    }
  }, [isAuthLoaded, isSignedIn, isSchoolAccessDenied, router, afterSignInUrl]);

  if (!isAuthLoaded) {
    return null;
  }

  if (isSignedIn && !isSchoolAccessDenied) {
    return null;
  }

  const canSubmitCredentials =
    email.trim().length > 0 &&
    password.length >= 6 &&
    !isSubmitting &&
    !isGoogleSubmitting;

  const canSubmitCode = verificationCode.length === 6 && !isSubmitting;

  async function handleCredentialsSubmit(
    event: React.SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!clerk.loaded || !canSubmitCredentials) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const result = await clerk.client.signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await clerk.setActive({
          session: result.createdSessionId,
        });

        router.push(afterSignInUrl);
      } else if (result.status === "needs_second_factor") {
        await clerk.client.signIn.prepareSecondFactor({
          strategy: "email_code",
        });

        setNeedsCode(true);
      } else {
        console.warn("Additional steps required for login:", result);

        setErrorMsg(
          `Login cannot proceed. Status: ${result.status}. Check Clerk settings.`,
        );
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      const clerkError = err as {
        errors?: Array<{ longMessage?: string }>;
      };

      setErrorMsg(
        clerkError.errors?.[0]?.longMessage || "Invalid email or password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCodeSubmit(
    event: React.SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!clerk.loaded || !canSubmitCode) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const result = await clerk.client.signIn.attemptSecondFactor({
        strategy: "email_code",
        code: verificationCode,
      });

      if (result.status === "complete") {
        await clerk.setActive({
          session: result.createdSessionId,
        });

        router.push(afterSignInUrl);
      } else {
        setErrorMsg("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Verification error:", err);

      const clerkError = err as {
        errors?: Array<{ longMessage?: string }>;
      };

      setErrorMsg(
        clerkError.errors?.[0]?.longMessage ||
          "Invalid code. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!clerk.loaded || isGoogleSubmitting || isSubmitting) {
      return;
    }

    setIsGoogleSubmitting(true);
    setErrorMsg("");

    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: afterSignInUrl,
      });
    } catch (err: unknown) {
      console.error("Google SSO error:", err);

      setErrorMsg("Failed to initialize Google Sign In.");
      setIsGoogleSubmitting(false);
    }
  }

  async function handleSwitchAccount() {
    if (!clerk.loaded || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await clerk.signOut();

      const params = new URLSearchParams();
      params.set("redirect_url", afterSignInUrl);

      router.replace(`/login?${params.toString()}`);
    } catch (err: unknown) {
      console.error("Sign out error:", err);
      setErrorMsg("Unable to switch accounts. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (isSignedIn && isSchoolAccessDenied) {
    return (
      <main className="flex flex-1 flex-col px-5 pb-8 pt-10">
        <section className="mb-8 text-center">
          <DrivingSchoolProfile school={schoolProfile} />

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Sign in to this school
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your current account does not have access to this driving school.
          </p>
        </section>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleSwitchAccount}
          disabled={isSubmitting || !clerk.loaded}
          className="w-full cursor-pointer rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isSubmitting ? "Signing out..." : "Sign in with another account"}
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-8 pt-10">
      <section className="mb-8 text-center">
        <DrivingSchoolProfile school={schoolProfile} />

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          {needsCode ? "Check your email" : "Sign in"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {needsCode
            ? "We sent a verification code to your email."
            : "Access your lessons, bookings, and account."}
        </p>
      </section>

      {errorMsg && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {needsCode ? (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="verificationCode"
              className="text-sm font-medium text-slate-900"
            >
              Verification Code
            </label>

            <input
              id="verificationCode"
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-mono text-sm tracking-[0.5em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmitCode || !clerk.loaded}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>

          <button
            type="button"
            onClick={() => {
              setNeedsCode(false);
              setVerificationCode("");
              setErrorMsg("");
            }}
            disabled={isSubmitting}
            className="mt-2 w-full py-3 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-900"
              >
                Email
              </label>

              <input
                id="email"
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
                htmlFor="password"
                className="text-sm font-medium text-slate-900"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <Link
              href="/login/forgot-password"
              className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={!canSubmitCredentials || !clerk.loaded}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-slate-200" />
            </div>

            <p className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                or
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting || !clerk.loaded}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon className="h-5 w-5" />

            {isGoogleSubmitting ? "Signing in..." : "Sign in with Google"}
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href={signUpHref}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Create account
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
