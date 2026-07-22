"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useSchoolId } from "./SchoolContext";

const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

export function StudentSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const schoolId = useSchoolId();

  useEffect(() => {
    if (!isLoaded || !user || !schoolId) return;

    let cancelled = false;

    async function ensureStudentRecord(attempt = 0) {
      try {
        const token = await getToken();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/students/sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ schoolId }),
          },
        );

        if (
          (res.status === 401 || res.status === 404) &&
          attempt < MAX_RETRIES &&
          !cancelled
        ) {
          const delay = BASE_DELAY * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
          return ensureStudentRecord(attempt + 1);
        }

        if (!res.ok) {
          console.error("Student sync failed:", res.status, await res.text());
        }
      } catch (err) {
        console.error("Failed to sync student:", err);
      }
    }

    ensureStudentRecord();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user, schoolId, getToken]);

  return null;
}
