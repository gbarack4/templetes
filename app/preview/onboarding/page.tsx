import { Suspense } from "react";
import { SuggestedInstructors } from "@/onboarding/SuggestedInstructors";

export default function OnboardingPreviewPage() {
  return (
    <Suspense>
      <SuggestedInstructors basePath="/preview/onboarding" />
    </Suspense>
  );
}
