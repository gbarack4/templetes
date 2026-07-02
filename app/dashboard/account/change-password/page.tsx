import type { Metadata } from "next";
import { ChangePasswordFlow } from "@/dashboard/ChangePasswordFlow";

export const metadata: Metadata = {
  title: "Change Password | Driving School",
  description: "Update your account password.",
};

export default function ChangePasswordPage() {
  return <ChangePasswordFlow />;
}
