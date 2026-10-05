import { notFound } from "next/navigation";

import { BookInstructorFlow } from "@/onboarding/BookInstructorFlow";
import { firstQueryValue } from "@/onboarding/booking-query";
import {
  getSuggestedInstructorById,
  toPublicInstructor,
} from "@/onboarding/suggested-instructors";

export default async function BookInstructorPreviewPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    suburb?: string | string[];
    preferredDate?: string | string[];
    lessonTime?: string | string[];
    lessonDuration?: string | string[];
  }>;
}>) {
  const { id } = await params;
  const query = await searchParams;
  const instructor = getSuggestedInstructorById(id);

  if (!instructor) {
    notFound();
  }

  return (
    <BookInstructorFlow
      instructor={toPublicInstructor(instructor)}
      initialSuburb={firstQueryValue(query.suburb)}
      initialDate={firstQueryValue(query.preferredDate)}
      initialTime={firstQueryValue(query.lessonTime)}
      initialDuration={firstQueryValue(query.lessonDuration)}
    />
  );
}
