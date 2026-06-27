import { notFound } from "next/navigation";
import { InstructorProfile } from "@/onboarding/InstructorProfile";
import { getSuggestedInstructorById } from "@/onboarding/suggested-instructors";

export default async function InstructorProfilePreviewPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const instructor = getSuggestedInstructorById(id);

  if (!instructor) {
    notFound();
  }

  return <InstructorProfile instructor={instructor} />;
}
