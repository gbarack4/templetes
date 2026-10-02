"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSchool } from "@/dashboard/SchoolContext";
import { AuthForm } from "@/lib/auth/AuthForm";
import { safeRedirect } from "@/lib/school-domain";
import { DrivingSchoolProfile } from "./DrivingSchoolProfile";

export function SignIn({
  defaultRedirectUrl = "/dashboard",
  signUpHref = "/sign-up",
}: Readonly<{
  defaultRedirectUrl?: string;
  signUpHref?: string;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const school = useSchool();
  const requested = safeRedirect(params.get("redirect_url"), defaultRedirectUrl);
  const embedBase = /^\/embed\/[^/]+/.exec(pathname)?.[0];
  const redirect =
    embedBase &&
    !(
      requested === embedBase ||
      requested.startsWith(`${embedBase}/`) ||
      requested.startsWith(`${embedBase}?`)
    )
      ? defaultRedirectUrl
      : requested;
  const resetHref = embedBase ? `${embedBase}/forgot-password` : "/login/forgot-password";
  return (
    <main className="flex flex-1 flex-col px-5 pb-8 pt-10">
      <section className="mb-8 text-center">
        <DrivingSchoolProfile
          school={{ name: school.schoolName, logoUrl: school.logoUrl }}
        />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Access your lessons, bookings, and account.
        </p>
      </section>
      <AuthForm mode="sign-in" onComplete={() => router.replace(redirect)} />
      <Link href={resetHref} className="mt-4 text-sm font-medium text-blue-600">
        Forgot password?
      </Link>
      <p className="mt-8 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href={signUpHref} className="font-medium text-blue-600">
          Create account
        </Link>
      </p>
    </main>
  );
}
