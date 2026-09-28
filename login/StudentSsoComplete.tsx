"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useSchoolId } from "@/dashboard/SchoolContext";

export function StudentSsoComplete() {
  const router = useRouter();
  const schoolId = useSchoolId();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const hasStarted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !schoolId || hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    async function syncStudent() {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Authentication token is unavailable");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/students/sync`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              schoolId,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to create student record: ${response.status}`,
          );
        }

        router.replace("/dashboard");
      } catch (error) {
        console.error("Failed to complete student Google sign-up:", error);

        setError(
          "We couldn't finish creating your student account. Please try again.",
        );
      }
    }

    void syncStudent();
  }, [getToken, isLoaded, isSignedIn, router, schoolId]);

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-5">
        <p className="text-center text-sm text-red-600">{error}</p>
      </main>
    );
  }

  return null;
}