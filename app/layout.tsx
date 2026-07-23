import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { SiteLoaderGate } from "@/components/SiteLoaderGate";
import { SchoolProvider } from "@/dashboard/SchoolContext";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import {
  getDomainFromHost,
  getSchoolByDomain,
  resolveSchoolLogoUrl,
} from "@/lib/api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Driving School",
  description: "Book your driving lessons today.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

async function getSchoolBranding() {
  try {
    const headerList = await headers();
    const host = headerList.get("host") || "";
    const domain = getDomainFromHost(host);
    const site = await getSchoolByDomain(domain);

    return {
      schoolId: site?.schoolId || "",
      schoolName: site?.schoolName || "",
      logoUrl: resolveSchoolLogoUrl(site),
    };
  } catch {
    return { schoolId: "", schoolName: "", logoUrl: "" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const school = await getSchoolBranding();

  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} antialiased`}>
        <body className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
          <SchoolProvider
            schoolId={school.schoolId}
            schoolName={school.schoolName}
            logoUrl={school.logoUrl}
          >
            <QueryProvider>
              <SiteLoaderGate>{children}</SiteLoaderGate>
            </QueryProvider>
          </SchoolProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
