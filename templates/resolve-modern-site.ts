import { buildFutureDates, mockRescheduleTimeSlots } from "@/dashboard/mock-data";
import type { RescheduleDateOption } from "@/dashboard/mock-data";
import { resolveSchoolProfile } from "@/login/school-profile";
import type { SiteConfig } from "./types";

export const mockModernNavLinks = [
  { label: "Home", href: "#" },
  { label: "About Us", href: "#" },
  { label: "Courses", href: "#" },
  { label: "Contact", href: "#" },
] as const;

export const mockModernLessonDurations = ["1 Hour", "1.5 Hours", "2 Hours"] as const;

export const mockModernLessonPackages = [
  { id: "pack-5", label: "5 Lesson Pack" },
  { id: "pack-10", label: "10 Lesson Pack" },
  { id: "pack-test", label: "Test Day Package" },
] as const;

export const mockModernTrustBadges = [
  "Qualified Instructors",
  "5-Star Reviews",
  "Flexible Scheduling",
  "Secure Booking",
] as const;

export const mockModernTransmissionOptions = ["Auto", "Manual"] as const;

export function resolveModernSite(data: SiteConfig) {
  const school = resolveSchoolProfile(data);

  return {
    school,
    brandName: school.name.split(" ")[0] || school.name,
    primaryColor: data.config?.primaryColor ?? "#2563eb",
    phoneNumber: data.phoneNumber ?? null,
    pickupHint:
      data.config?.pickupHint ?? "We'll use this to find instructors near you.",
    loginPath: data.config?.loginPath ?? "/login",
    navLinks: data.config?.navLinks ?? [...mockModernNavLinks],
    transmissionOptions:
      data.config?.transmissionOptions ?? [...mockModernTransmissionOptions],
    lessonDurations: data.config?.lessonDurations ?? [...mockModernLessonDurations],
    lessonPackages: data.config?.lessonPackages ?? [...mockModernLessonPackages],
    timeSlots: data.config?.timeSlots ?? [...mockRescheduleTimeSlots],
    trustBadges: data.config?.trustBadges ?? [...mockModernTrustBadges],
    availableDates: buildFutureDates(),
  };
}

export type ResolvedModernSite = ReturnType<typeof resolveModernSite>;

export function resolveAvailableDates(
  _data: SiteConfig,
  fallback: RescheduleDateOption[],
): RescheduleDateOption[] {
  // Replace with API-provided dates when backend is connected.
  return fallback;
}
