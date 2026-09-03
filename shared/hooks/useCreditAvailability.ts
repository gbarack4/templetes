"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { useSchoolId } from "@/dashboard/SchoolContext";
import { fetchCreditAvailability } from "@/lib/credit-booking-api";
import type { CreditAvailabilitySearch } from "@/types/credit-booking";

const creditAvailabilityKey = (
  schoolId: string,
  userId: string | null | undefined,
  search: CreditAvailabilitySearch | null,
) =>
  [
    "credit-availability",
    schoolId,
    userId,
    search?.instructorId ?? null,
    search?.month ?? null,
    search?.durationMinutes ?? null,
  ] as const;

export function useCreditAvailability(search: CreditAvailabilitySearch | null) {
  const schoolId = useSchoolId();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const enabled = Boolean(
    isLoaded &&
    isSignedIn &&
    schoolId &&
    search?.instructorId &&
    search.month &&
    search.durationMinutes,
  );

  const query = useQuery({
    queryKey: creditAvailabilityKey(schoolId, userId, search),
    enabled,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) => {
      if (!search) {
        return [];
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Please sign in to view instructor availability.");
      }

      return fetchCreditAvailability(schoolId, token, search, signal);
    },
  });

  let error = query.error?.message ?? "";

  if (isLoaded && !isSignedIn) {
    error = "Please sign in to view instructor availability.";
  }

  if (isLoaded && !schoolId) {
    error = "The school could not be identified.";
  }

  return {
    availability: enabled && !error ? (query.data ?? []) : [],
    loading: !isLoaded || (enabled && query.isPending),
    fetching: query.isFetching,
    error,
    refetch: query.refetch,
  };
}
