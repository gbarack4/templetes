"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSchoolId } from "@/dashboard/SchoolContext";

type SubmitStudentReviewInput = {
  bookingId: string;
  rating: number;
  comment: string;
};

export type StudentReviewResponse = {
  review: {
    id: string;
    bookingId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  };
};

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();

    if (typeof data === "object" && data !== null && "message" in data) {
      const message = data.message;

      if (typeof message === "string") {
        return message;
      }

      if (Array.isArray(message)) {
        return message
          .filter((item): item is string => typeof item === "string")
          .join(", ");
      }
    }
  } catch {
    return `Unable to submit review (${response.status}).`;
  }

  return `Unable to submit review (${response.status}).`;
}

export function useStudentReview() {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const mutation = useMutation<
    StudentReviewResponse,
    Error,
    SubmitStudentReviewInput
  >({
    mutationFn: async ({ bookingId, rating, comment }) => {
      if (!isLoaded || !isSignedIn || !schoolId) {
        throw new Error("Unable to submit review.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("Backend API URL is not configured.");
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Your session is unavailable. Please sign in again.");
      }

      const response = await fetch(
        `${apiUrl}/reviews/school/${schoolId}/booking/${bookingId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating,
            comment: comment || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      return response.json() as Promise<StudentReviewResponse>;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["student-bookings"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["instructor-review-profile"],
        }),
      ]);
    },
  });

  return {
    submitReview: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
