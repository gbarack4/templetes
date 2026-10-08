"use client";

import { useBookingInstructorProfile } from "@/shared/hooks/useBookingInstructorProfile";
import type { InstructorOption } from "@/types/instructor";

import { InstructorProfile } from "@/onboarding/InstructorProfile";

type DashboardInstructorProfileProps = Readonly<{
  instructorId: string;
}>;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardInstructorProfile({
  instructorId,
}: DashboardInstructorProfileProps) {
  const {
    instructor: bookingInstructor,
    loading,
    error,
  } = useBookingInstructorProfile(instructorId);

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <p className="text-sm text-slate-400">Loading instructor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        <p className="text-center text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!bookingInstructor) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <p className="text-sm text-slate-400">Instructor not found.</p>
      </div>
    );
  }

  const instructor: InstructorOption = {
    id: bookingInstructor.id,
    name: bookingInstructor.name,
    initials: getInitials(bookingInstructor.name),
    avatarUrl: bookingInstructor.avatarUrl ?? "",
    location: [bookingInstructor.suburb, bookingInstructor.postcode]
      .filter(Boolean)
      .join(" "),
    pricePerHour:
      bookingInstructor.pricePerHour != null
        ? Number(bookingInstructor.pricePerHour)
        : null,
  };

  return (
    <InstructorProfile
      instructor={instructor}
      bookHref="/dashboard/book"
      contact={
        bookingInstructor.hasActiveBooking
          ? { phone: bookingInstructor.phone }
          : undefined
      }
    />
  );
}
