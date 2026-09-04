"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { useSchoolId } from "@/dashboard/SchoolContext";
import type {
  Lesson,
  LessonStatus,
  StudentBookingApiItem,
  StudentBookingsResponse,
} from "@/dashboard/types";

type UseStudentBookingsOptions = {
  status?: LessonStatus;
  query?: string;
};

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(date);
}

function parsePricePerHour(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const price = Number(value);

  return Number.isFinite(price) ? price : null;
}

function getBookingLocation(booking: StudentBookingApiItem): string {
  return (
    booking.pickupAddress ||
    booking.pickupSuburb ||
    booking.pickupPostcode ||
    "Pickup location"
  );
}

function mapBookingToLesson(
  booking: StudentBookingApiItem,
  timezone: string,
  status: LessonStatus,
): Lesson {
  const start = new Date(booking.startDatetime);
  const end = new Date(booking.endDatetime);

  const month = new Intl.DateTimeFormat("en-AU", {
    month: "short",
    timeZone: timezone,
  })
    .format(start)
    .toUpperCase();

  const day = Number(
    new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      timeZone: timezone,
    }).format(start),
  );

  const weekday = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    timeZone: timezone,
  })
    .format(start)
    .toUpperCase();

  const hours = (end.getTime() - start.getTime()) / 3_600_000;

  return {
    id: booking.id,
    month,
    day,
    weekday,
    timeRange: `${formatTime(start, timezone)} – ${formatTime(end, timezone)}`,
    instructor: {
      id: booking.instructor.id,
      name: booking.instructor.name,
      avatarUrl: booking.instructor.avatarUrl,
      pricePerHour: parsePricePerHour(booking.instructor.pricePerHour),
    },
    location: getBookingLocation(booking),
    hours,
    status,
  };
}

export function useStudentBookings({
  status = "upcoming",
  query = "",
}: UseStudentBookingsOptions = {}) {
  const schoolId = useSchoolId();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const enabled = Boolean(isLoaded && isSignedIn && schoolId);

  const result = useQuery<StudentBookingsResponse>({
    queryKey: ["student-bookings", schoolId, userId, status, query],
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
    queryFn: async ({ signal }) => {
      if (!isSignedIn || !schoolId) {
        throw new Error("Unable to load bookings.");
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
        status,
      });

      const normalizedQuery = query.trim();

      if (normalizedQuery) {
        params.set("query", normalizedQuery);
      }

      const response = await fetch(
        `${apiUrl}/bookings/school/${schoolId}/student?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Unable to load bookings (${response.status}).`);
      }

      return response.json() as Promise<StudentBookingsResponse>;
    },
  });

  const data = result.data;

  return {
    bookings:
      data?.bookings.map((booking) =>
        mapBookingToLesson(booking, data.timezone, status),
      ) ?? [],
    counts: data?.counts ?? {
      upcoming: 0,
      completed: 0,
      cancelled: 0,
    },
    timezone: data?.timezone ?? null,
    loading: !isLoaded || (enabled && result.isPending),
    error: result.error?.message ?? null,
    refetch: result.refetch,
  };
}
