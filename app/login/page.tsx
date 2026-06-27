import type { Metadata } from "next";
import { SignIn } from "@/login/SignIn";

export const metadata: Metadata = {
  title: "Sign In | Driving School",
  description: "Sign in to your driving school account.",
};

export default function LoginPage() {
  return <SignIn />;
}
