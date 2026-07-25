import type { Metadata } from "next";
import { EmergencyContactFlow } from "@/dashboard/EmergencyContactFlow";

export const metadata: Metadata = {
  title: "Emergency Contact | Driving School",
  description: "Update your emergency contact details.",
};

export default function EmergencyContactPage() {
  return <EmergencyContactFlow />;
}
