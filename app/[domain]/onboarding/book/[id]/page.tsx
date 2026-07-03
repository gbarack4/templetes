import { notFound } from "next/navigation";
import { BookInstructorFlow } from "@/onboarding/BookInstructorFlow";
import { getSuggestedInstructorById } from "@/onboarding/suggested-instructors";

export default async function SchoolBookInstructorPage({
  params,
}: Readonly<{
  params: Promise<{ domain: string; id: string }>;
}>) {
  const { domain, id } = await params;
  const instructor = getSuggestedInstructorById(id);

  if (!instructor) {
    notFound();
  }

  return (
    <BookInstructorFlow
      instructor={instructor}
      returnPath={`/${domain}/onboarding`}
    />
  );
}
