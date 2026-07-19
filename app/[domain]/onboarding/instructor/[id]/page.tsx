import { Suspense } from "react";
import { notFound } from "next/navigation";
import { InstructorProfile } from "@/onboarding/InstructorProfile";
import { getSuggestedInstructorById } from "@/onboarding/suggested-instructors";

export default async function SchoolInstructorProfilePage({
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
    <Suspense>
      <InstructorProfile
        instructor={instructor}
        basePath={`/${domain}/onboarding`}
      />
    </Suspense>
  );
}
