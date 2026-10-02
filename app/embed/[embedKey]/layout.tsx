import { loadStudentAuthConfig } from "@/lib/auth/config.server";
import { notFound } from "next/navigation";

import { SchoolProvider } from "@/dashboard/SchoolContext";
import { getSchoolByEmbedKey } from "@/lib/api";

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ embedKey: string }>;
}>;

export default async function EmbedLayout({ children, params }: Props) {
  const { embedKey } = await params;

  const school = await getSchoolByEmbedKey(embedKey);

  if (!school) {
    notFound();
  }

  const auth = await loadStudentAuthConfig(school.schoolId, { embedKey });

  return (
    <SchoolProvider
      {...auth}
      schoolId={school.schoolId}
      schoolName={school.schoolName}
      logoUrl={school.logoUrl ?? ""}
    >
      {children}
    </SchoolProvider>
  );
}
