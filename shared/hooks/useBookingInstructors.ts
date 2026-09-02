"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useSchoolId } from "@/dashboard/SchoolContext";
import type { BookingInstructor } from "@/types/instructor";

const SEARCH_DEBOUNCE_MS = 300;

export function useBookingInstructors(searchQuery = "") {
  const schoolId = useSchoolId();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchQuery]);

  const enabled = Boolean(isLoaded && isSignedIn && schoolId);

  const query = useQuery<BookingInstructor[]>({
    queryKey: ["booking-instructors", schoolId, userId, debouncedSearchQuery],
    enabled,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,

    queryFn: async ({ signal }) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not configured.");
      }

      if (!schoolId) {
        throw new Error("The school could not be identified.");
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Please sign in to view instructors.");
      }

      const baseUrl = `${apiUrl}/bookings/school/${schoolId}/instructors`;

      const url = debouncedSearchQuery
        ? `${baseUrl}/search?query=${encodeURIComponent(debouncedSearchQuery)}`
        : baseUrl;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error(`Unable to load instructors (${response.status}).`);
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new TypeError("Invalid instructor list response.");
      }

      return data as BookingInstructor[];
    },
  });

  let error = query.error?.message ?? "";

  if (isLoaded && !isSignedIn) {
    error = "Please sign in to view instructors.";
  } else if (isLoaded && !schoolId) {
    error = "The school could not be identified.";
  }

  return {
    instructors: enabled && !error ? (query.data ?? []) : [],
    loading: !isLoaded || (enabled && query.isPending),
    searching: Boolean(searchQuery.trim()),
    error,
    refetch: query.refetch,
  };
}
