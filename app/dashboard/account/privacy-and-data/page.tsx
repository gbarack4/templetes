import type { Metadata } from "next";
import { PrivacyAndDataFlow } from "@/dashboard/PrivacyAndDataFlow";

export const metadata: Metadata = {
  title: "Privacy and Data | Driving School",
  description: "Manage privacy settings and delete your account.",
};

export default function PrivacyAndDataPage() {
  return <PrivacyAndDataFlow />;
}
