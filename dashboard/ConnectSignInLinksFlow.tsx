"use client";
import { useRouter } from "next/navigation";
import { FlowPageHeader } from "./components/FlowPageHeader";
import { FlowPageContent } from "./components/FlowPageContent";

export function ConnectSignInLinksFlow() {
  const router = useRouter();
  return (
    <>
      <FlowPageHeader
        title="Sign in links"
        onBack={() => router.push("/dashboard/account")}
      />
      <FlowPageContent>
        <p className="text-sm text-slate-500">
          Social sign-in is not available yet. Please use your email and password.
        </p>
      </FlowPageContent>
    </>
  );
}
