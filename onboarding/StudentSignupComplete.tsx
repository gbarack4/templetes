"use client";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/lib/auth/AuthForm";

export function StudentSignupComplete() {
  const router = useRouter();
  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8">
      <h1 className="text-xl font-bold">Complete your account</h1>
      <AuthForm mode="sign-in" onComplete={() => router.replace("/dashboard")} />
    </main>
  );
}
