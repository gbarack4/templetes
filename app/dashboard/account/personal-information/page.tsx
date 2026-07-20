import type { Metadata } from "next";
import { PersonalInformationFlow } from "@/dashboard/PersonalInformationFlow";

export const metadata: Metadata = {
  title: "Personal Information | Driving School",
  description: "Update your personal account details.",
};

export default function PersonalInformationPage() {
  return <PersonalInformationFlow />;
}
