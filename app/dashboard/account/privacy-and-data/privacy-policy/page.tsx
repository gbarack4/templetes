import type { Metadata } from "next";
import { PrivacyPolicyFlow } from "@/dashboard/PrivacyPolicyFlow";

export const metadata: Metadata = {
  title: "Privacy Policy | Driving School",
  description: "How we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyFlow />;
}
