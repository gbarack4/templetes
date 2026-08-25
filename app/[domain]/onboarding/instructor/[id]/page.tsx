import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getSchoolByDomain } from "@/lib/api";
import { fetchPublicInstructor } from "@/lib/public-booking-api";
import { firstQueryValue } from "@/onboarding/booking-query";
import { InstructorProfile } from "@/onboarding/InstructorProfile";

export default async function SchoolInstructorProfilePage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{
    domain: string;
    id: string;
  }>;
  searchParams: Promise<{
    suburb?: string | string[];
    preferredDate?: string | string[];
    transmission?: string | string[];
  }>;
}>) {
  const { domain, id } = await params;
  const query = await searchParams;

  const suburb = firstQueryValue(query.suburb);
  const preferredDate = firstQueryValue(query.preferredDate);

  if (!suburb || !preferredDate) {
    notFound();
  }

  const siteData = await getSchoolByDomain(domain);

  if (!siteData?.schoolId) {
    notFound();
  }

  const rawInstructor = await fetchPublicInstructor(
    siteData.schoolId,
    id,
    suburb,
    preferredDate,
  );

  if (!rawInstructor) {
    notFound();
  }

  const nameParts = (rawInstructor.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : rawInstructor.name?.slice(0, 2).toUpperCase() || "IN";

  const location =
    [rawInstructor.suburb, rawInstructor.postcode].filter(Boolean).join(", ") ||
    "Location not specified";

  const instructor = {
    ...rawInstructor,
    avatarUrl: rawInstructor.avatarUrl ?? "",
    initials,
    location,
    rating: 5,
    reviewCount: 0,
    lessonsCompleted: 0,
  };

  return (
    <Suspense fallback={null}>
      <InstructorProfile instructor={instructor} basePath="/onboarding" />
    </Suspense>
  );
}
