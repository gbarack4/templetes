import { notFound } from "next/navigation";
import { BookInstructorFlow } from "@/onboarding/BookInstructorFlow";
import { getSuggestedInstructorById } from "@/onboarding/suggested-instructors";

export default async function BookInstructorPreviewPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const instructor = getSuggestedInstructorById(id);

  if (!instructor) {
    notFound();
  }

  return <BookInstructorFlow instructor={instructor} />;
}
