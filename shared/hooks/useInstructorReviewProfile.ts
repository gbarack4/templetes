"use client";

import { useQuery } from "@tanstack/react-query";

export type InstructorReviewItem = {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: string;

  studentName: string | null;
  studentAvatarUrl: string | null;

  schoolId: string;
  schoolName: string;

  lessonStartDatetime: string;
  lessonEndDatetime: string;
  lessonCompletedAt: string | null;
};

export type InstructorReviewProfile = {
  instructorId: string;
  completedLessons: number;
  reviewCount: number;
  averageRating: number;
  reviews: InstructorReviewItem[];
};

type UseInstructorReviewProfileOptions = {
  instructorId: string | null | undefined;
  limit?: number;
  offset?: number;
};

export function useInstructorReviewProfile({
  instructorId,
  limit = 20,
  offset = 0,
}: UseInstructorReviewProfileOptions) {
  const enabled = Boolean(instructorId);

  const result = useQuery<InstructorReviewProfile>({
    queryKey: ["instructor-review-profile", instructorId, limit, offset],
    enabled,
    staleTime: 30_000,
    retry: false,
    queryFn: async ({ signal }) => {
      if (!instructorId) {
        throw new Error("Instructor is required.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("Backend API URL is not configured.");
      }

      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });

      const response = await fetch(
        `${apiUrl}/reviews/instructors/${instructorId}?${params.toString()}`,
        {
          cache: "no-store",
          signal,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load instructor reviews (${response.status}).`,
        );
      }

      return response.json() as Promise<InstructorReviewProfile>;
    },
  });

  return {
    profile: result.data ?? null,
    completedLessons: result.data?.completedLessons ?? 0,
    reviewCount: result.data?.reviewCount ?? 0,
    averageRating: result.data?.averageRating ?? 0,
    reviews: result.data?.reviews ?? [],
    loading: enabled && result.isPending,
    error: result.error?.message ?? null,
    refetch: result.refetch,
  };
}
