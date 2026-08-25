import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getSchoolByDomain } from "@/lib/api";
import { SuggestedInstructors } from "@/onboarding/SuggestedInstructors";

export default async function SchoolOnboardingPage({
  params,
}: Readonly<{
  params: Promise<{ domain: string }>;
}>) {
  const { domain } = await params;

  const siteData = await getSchoolByDomain(domain);

  if (!siteData?.schoolId) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <SuggestedInstructors
        schoolId={siteData.schoolId}
        basePath="/onboarding"
      />
    </Suspense>
  );
}
