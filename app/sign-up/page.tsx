"use client";

import { useRouter } from "next/navigation";
import { BookingSignUp } from "@/onboarding/BookingSignUp";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <BookingSignUp
      description="Create an account to book lessons and manage your schedule."
      onBack={() => router.push("/login")}
      onComplete={() => router.push("/dashboard")}
    />
  );
}
