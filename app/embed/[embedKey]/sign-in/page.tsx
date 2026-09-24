import type { Metadata } from "next";
import { Suspense } from "react";

import { SignIn } from "@/login/SignIn";

export const metadata: Metadata = {
  title: "Sign In | Driving School",
  description: "Sign in to your driving school account.",
};

type Props = Readonly<{
  params: Promise<{ embedKey: string }>;
}>;

export default async function EmbedSignInPage({ params }: Props) {
  const { embedKey } = await params;
  const basePath = `/embed/${embedKey}`;

  return (
    <Suspense fallback={null}>
      <SignIn
        defaultRedirectUrl={basePath}
        signUpHref={`${basePath}/sign-up`}
      />
    </Suspense>
  );
}
