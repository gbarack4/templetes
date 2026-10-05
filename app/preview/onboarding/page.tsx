import { Suspense } from "react";

import { SuggestedInstructors } from "@/onboarding/SuggestedInstructors";

export default function OnboardingPreviewPage() {
  return (
    <Suspense fallback={null}>
      <SuggestedInstructors basePath="/preview/onboarding" />
    </Suspense>
  );
}
