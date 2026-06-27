import type { Metadata } from "next";
import { ForgotPassword } from "@/login/ForgotPassword";

export const metadata: Metadata = {
  title: "Forgot Password | Driving School",
  description: "Reset your driving school account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
