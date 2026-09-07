"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSchoolId } from "@/dashboard/SchoolContext";

export type StudentCancelBookingResponse = {
  booking: {
    id: string;
    status: string;
  };
  creditReturnedMinutes: number;
  balanceMinutes: number;
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
    // Fall through to the default message.
  }

  return `Unable to cancel booking (${response.status}).`;
}

export function useStudentCancelBooking() {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();

  const { getToken, isLoaded, isSignedIn } = useAuth();

  const mutation = useMutation<StudentCancelBookingResponse, Error, string>({
    mutationFn: async (bookingId) => {
      if (!isLoaded || !isSignedIn || !schoolId) {
        throw new Error("Unable to cancel booking.");
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
        `${apiUrl}/bookings/school/${schoolId}/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      return response.json() as Promise<StudentCancelBookingResponse>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["student-bookings"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["student-credit-balance"],
      });
    },
  });

  return {
    cancelBooking: mutation.mutateAsync,
    isCancelling: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
