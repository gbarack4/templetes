import { notFound } from "next/navigation";
import { BookInstructorFlow } from "@/onboarding/BookInstructorFlow";
import { firstQueryValue } from "@/onboarding/booking-query";
import { getSuggestedInstructorById } from "@/onboarding/suggested-instructors";

export default async function SchoolBookInstructorPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ domain: string; id: string }>;
  searchParams: Promise<{
    suburb?: string | string[];
    testDate?: string | string[];
    lessonTime?: string | string[];
    lessonDuration?: string | string[];
  }>;
}>) {
  const { domain, id } = await params;
  const query = await searchParams;
  const instructor = getSuggestedInstructorById(id);

  if (!instructor) {
    notFound();
  }

  return (
    <BookInstructorFlow
      instructor={instructor}
      returnPath={`/${domain}/onboarding`}
      initialSuburb={firstQueryValue(query.suburb)}
      initialDate={firstQueryValue(query.testDate)}
      initialTime={firstQueryValue(query.lessonTime)}
      initialDuration={firstQueryValue(query.lessonDuration)}
    />
  );
}
