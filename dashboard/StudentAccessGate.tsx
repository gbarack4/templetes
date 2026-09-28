"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { useSchoolId } from "./SchoolContext";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function StudentAccessGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const schoolId = useSchoolId();

  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !schoolId) return;

    const controller = new AbortController();

    async function checkAccess(attempt = 0): Promise<void> {
      try {
        const token = await getToken();

        if (controller.signal.aborted) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/students/school/${schoolId}/me`,
          {
            headers: {
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            },
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) return;

        if (response.ok) {
          setIsAllowed(true);
          return;
        }

        if (response.status === 404 && attempt < MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY),
          );

          if (controller.signal.aborted) return;

          await checkAccess(attempt + 1);
          return;
        }

        if (response.status === 404) {
          await signOut();

          if (!controller.signal.aborted) {
            window.location.replace("/login");
          }

          return;
        }

        console.error(
          "Failed to verify student access:",
          response.status,
          await response.text(),
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Failed to verify student access:", error);
      }
    }

    void checkAccess();

    return () => {
      controller.abort();
    };
  }, [getToken, isLoaded, isSignedIn, schoolId, signOut]);

  if (!isAllowed) {
    return null;
  }

  return children;
}