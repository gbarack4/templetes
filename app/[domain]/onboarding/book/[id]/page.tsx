import { notFound } from "next/navigation";

import { getSchoolByDomain } from "@/lib/api";
import { fetchPublicInstructor } from "@/lib/public-booking-api";
import { BookInstructorFlow } from "@/onboarding/BookInstructorFlow";
import { firstQueryValue } from "@/onboarding/booking-query";

export default async function SchoolBookInstructorPage({
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
    lessonTime?: string | string[];
    lessonDuration?: string | string[];
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
    <BookInstructorFlow
      instructor={instructor}
      initialSuburb={suburb}
      initialDate={preferredDate}
      initialTime={firstQueryValue(query.lessonTime)}
      initialDuration={firstQueryValue(query.lessonDuration)}
    />
  );
}
