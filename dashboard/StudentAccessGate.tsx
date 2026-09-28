"use client";

import { useAuth } from "@clerk/nextjs";
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
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
          const redirectUrl = `${window.location.pathname}${window.location.search}`;

          const loginUrl = new URL("/login", window.location.origin);
          loginUrl.searchParams.set("reason", "school_access");
          loginUrl.searchParams.set("redirect_url", redirectUrl);

          window.location.replace(loginUrl.toString());
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
  }, [getToken, isLoaded, isSignedIn, schoolId]);

  if (!isAllowed) {
    return null;
  }

  return children;
}