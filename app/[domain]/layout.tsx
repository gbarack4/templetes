import { getSchoolByDomain } from "@/lib/api";
import { WebsiteIntegrations } from "@/components/WebsiteIntegrations";

export default async function SchoolWebsiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}>) {
  const { domain } = await params;
  const school = domain === "preview" ? null : await getSchoolByDomain(domain);
  return (
    <>
      {school && (
        <WebsiteIntegrations
          schoolId={school.schoolId}
          config={school.integrations}
        />
      )}
      {children}
    </>
  );
}
