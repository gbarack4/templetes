"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/auth/AuthProvider";
import { useSchoolId } from "@/dashboard/SchoolContext";
import type { BookingInstructorProfile } from "@/types/instructor";

export function useBookingInstructorProfile(instructorId: string) {
  const schoolId = useSchoolId();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const enabled = Boolean(isLoaded && isSignedIn && schoolId && instructorId);

  const query = useQuery<BookingInstructorProfile>({
    queryKey: ["booking-instructor-profile", schoolId, userId, instructorId],
    enabled,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    queryFn: async ({ signal }) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("API URL is not configured.");
      if (!schoolId) throw new Error("The school could not be identified.");
      const token = await getToken();
      if (!token) throw new Error("Please sign in to view this instructor.");

      const response = await fetch(
        `${apiUrl}/bookings/school/${schoolId}/instructors/${instructorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-school-id": schoolId,
          },
          cache: "no-store",
          signal,
        },
      );
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Instructor not found."
            : `Unable to load instructor (${response.status}).`,
        );
      }
      const data: BookingInstructorProfile = await response.json();
      return data;
    },
  });

  let error = query.error?.message ?? "";
  if (isLoaded && !isSignedIn) {
    error = "Please sign in to view this instructor.";
  } else if (isLoaded && !schoolId) {
    error = "The school could not be identified.";
  }

  return {
    instructor: enabled && !error ? query.data : undefined,
    loading: !isLoaded || (enabled && query.isPending),
    error,
  };
}
