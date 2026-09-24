"use client";

import { useParams, useRouter } from "next/navigation";

import { BookingSignUp } from "@/onboarding/BookingSignUp";

export default function EmbedSignUpPage() {
  const router = useRouter();
  const { embedKey } = useParams<{ embedKey: string }>();

  const basePath = `/embed/${embedKey}`;

  return (
    <BookingSignUp
      description="Create an account to book lessons and manage your schedule."
      onBack={() => router.push(basePath)}
      onComplete={() => router.push(basePath)}
      onSignIn={() => {
        router.push(
          `${basePath}/sign-in?redirect_url=${encodeURIComponent(basePath)}`,
        );
      }}
    />
  );
}
