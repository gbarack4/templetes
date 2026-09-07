"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSchoolId } from "@/dashboard/SchoolContext";

export type RescheduleSlot = {
  startDatetime: string;
  endDatetime: string;
  startTime: string;
  endTime: string;
};

type RescheduleBookingResponse = {
  booking: {
    id: string;
    startDatetime: string;
    endDatetime: string;
    status: string;
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
    // Use fallback below.
  }

  return `Request failed (${response.status}).`;
}

export function useStudentRescheduleSlots(
  bookingId: string,
  date: string | null,
) {
  const schoolId = useSchoolId();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const enabled = Boolean(
    isLoaded && isSignedIn && schoolId && bookingId && date,
  );

  const query = useQuery<RescheduleSlot[]>({
    queryKey: ["student-reschedule-slots", schoolId, bookingId, date],
    enabled,
    staleTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      if (!schoolId || !date || !isSignedIn) {
        throw new Error("Unable to load available times.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("Backend API URL is not configured.");
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Your session is unavailable. Please sign in again.");
      }

      const params = new URLSearchParams({
        date,
      });

      const response = await fetch(
        `${apiUrl}/bookings/school/${schoolId}/${bookingId}/reschedule-slots?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal,
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      return response.json() as Promise<RescheduleSlot[]>;
    },
  });

  return {
    slots: query.data ?? [],
    loading: enabled && query.isPending,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

export function useStudentRescheduleBooking() {
  const schoolId = useSchoolId();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const queryClient = useQueryClient();

  const mutation = useMutation<
    RescheduleBookingResponse,
    Error,
    {
      bookingId: string;
      startDatetime: string;
    }
  >({
    mutationFn: async ({ bookingId, startDatetime }) => {
      if (!isLoaded || !isSignedIn || !schoolId) {
        throw new Error("Unable to reschedule booking.");
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
        `${apiUrl}/bookings/school/${schoolId}/${bookingId}/reschedule`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDatetime,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      return response.json() as Promise<RescheduleBookingResponse>;
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["student-bookings"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["student-reschedule-slots"],
      });
    },
  });

  return {
    rescheduleBooking: mutation.mutateAsync,
    isRescheduling: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
