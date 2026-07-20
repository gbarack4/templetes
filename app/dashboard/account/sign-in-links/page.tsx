import type { Metadata } from "next";
import { ConnectSignInLinksFlow } from "@/dashboard/ConnectSignInLinksFlow";

export const metadata: Metadata = {
  title: "Sign In Links | Driving School",
  description: "Connect Google or Facebook for faster sign in.",
};

export default function SignInLinksPage() {
  return <ConnectSignInLinksFlow />;
}
