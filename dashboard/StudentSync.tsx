"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useSchoolId } from "./SchoolContext";

export function StudentSync() {
  const { user, isLoaded } = useUser();
  const schoolId = useSchoolId();

  useEffect(() => {
    if (!isLoaded || !user || !schoolId) return;

    const currentUser = user;

    async function ensureStudentRecord() {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            schoolId: schoolId,
            email: currentUser.primaryEmailAddress?.emailAddress,
            phone: (currentUser.unsafeMetadata as { phone_number?: string })
              ?.phone_number,
          }),
        });
      } catch (err) {
        console.error("Failed to sync student:", err);
      }
    }

    ensureStudentRecord();
  }, [isLoaded, user, schoolId]);

  return null;
}
