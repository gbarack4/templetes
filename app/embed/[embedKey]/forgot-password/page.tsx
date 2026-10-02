import { ForgotPassword } from "@/login/ForgotPassword";
export default async function EmbedForgotPasswordPage({
  params,
}: Readonly<{ params: Promise<{ embedKey: string }> }>) {
  const { embedKey } = await params;
  return <ForgotPassword loginHref={`/embed/${embedKey}/sign-in`} />;
}
