import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { SiteLoaderGate } from "@/components/SiteLoaderGate";
import { SchoolProvider } from "@/dashboard/SchoolContext";
import "./globals.css";
import { getSchoolByDomain } from "@/lib/api";
import { schoolDomainFromHost } from "@/lib/school-domain";
import { loadStudentAuthConfig } from "@/lib/auth/config.server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://driveinstructor.pro"
      : "http://localhost:3002",
  ),
  title: "Driving School",
  description: "Book your driving lessons today.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

async function getSchoolConfig() {
  const headerList = await headers();
  const domain = schoolDomainFromHost(
    headerList.get("host") || "",
    process.env.NEXT_PUBLIC_BASE_DOMAIN,
  );
  if (!domain || domain === "preview")
    return {
      schoolId: "",
      schoolName: "",
      logoUrl: "",
      authConfig: null,
      authError: null,
    };
  const site = await getSchoolByDomain(domain);
  if (!site)
    return {
      schoolId: "",
      schoolName: "",
      logoUrl: "",
      authConfig: null,
      authError: null,
    };
  return {
    schoolId: site.schoolId,
    schoolName: site.schoolName,
    logoUrl: site.logoUrl ?? "",
    ...(await loadStudentAuthConfig(site.schoolId, { domain })),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schoolConfig = await getSchoolConfig();

  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col bg-white font-sans text-slate-900">
        <SchoolProvider
          schoolId={schoolConfig.schoolId}
          schoolName={schoolConfig.schoolName}
          logoUrl={schoolConfig.logoUrl}
          authConfig={schoolConfig.authConfig}
          authError={schoolConfig.authError}
        >
          <SiteLoaderGate>{children}</SiteLoaderGate>
        </SchoolProvider>
      </body>
    </html>
  );
}
