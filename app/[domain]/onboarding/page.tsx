import { Suspense } from "react";
import { SuggestedInstructors } from "@/onboarding/SuggestedInstructors";

export default async function SchoolOnboardingPage({
  params,
}: Readonly<{
  params: Promise<{ domain: string }>;
}>) {
  const { domain } = await params;

  return (
    <Suspense>
      <SuggestedInstructors basePath={`/${domain}/onboarding`} />
    </Suspense>
  );
}
