"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { useSchoolId } from "@/dashboard/SchoolContext";

type StudentCreditBalance = Readonly<{
  balanceMinutes: number;
}>;

export function useStudentCreditBalance() {
  const schoolId = useSchoolId();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const enabled = Boolean(isLoaded && isSignedIn && schoolId);

  const query = useQuery<StudentCreditBalance>({
    queryKey: ["student-credit-balance", schoolId, userId],
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
    queryFn: async ({ signal }) => {
      if (!isSignedIn || !schoolId) {
        throw new Error("Sign in to your school account to view your credit.");
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
        `${apiUrl}/credits/school/${schoolId}/balance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Unable to load credit balance (${response.status}).`);
      }

      const data: unknown = await response.json();

      const rawMinutes =
        typeof data === "object" &&
        data !== null &&
        "balanceMinutes" in data
          ? data.balanceMinutes
          : null;

      const parsedMinutes =
        typeof rawMinutes === "number"
          ? rawMinutes
          : typeof rawMinutes === "string"
            ? Number(rawMinutes)
            : NaN;

      if (!Number.isFinite(parsedMinutes) || parsedMinutes < 0) {
        throw new Error("The server returned an invalid credit balance.");
      }

      return {
        balanceMinutes: Math.round(parsedMinutes),
      };
    },
  });

  let error: string | null = null;

  if (isLoaded && !isSignedIn) {
    error = "Please sign in to view your credit balance.";
  } else if (!schoolId) {
    error = "Unable to identify the school.";
  } else if (query.error) {
    error = query.error.message;
  }

  return {
    balanceMinutes: error ? null : (query.data?.balanceMinutes ?? null),
    loading: !isLoaded || (enabled && query.isPending),
    error,
    refetch: query.refetch,
  };
}
