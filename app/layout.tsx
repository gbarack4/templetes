import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { SiteLoaderGate } from "@/components/SiteLoaderGate";
import { SchoolProvider } from "@/dashboard/SchoolContext";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/shared/providers/QueryProvider";

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

async function getSchoolConfig() {
  try {
    const headerList = await headers();
    const host = headerList.get("host") || "";
    const domain = host.split(".")[0];

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/websites/${domain}`,
      { cache: "no-store" },
    );
    if (!res.ok) return { schoolId: "" };
    const data = await res.json();
    return {
      schoolId: data?.schoolId || "",
      schoolName: data?.schoolName || "",
      logoUrl: data?.logoUrl || "",
    };
  } catch {
    return { schoolId: "" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schoolConfig = await getSchoolConfig();

  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} antialiased`}>
        <body className="flex min-h-dvh flex-col bg-white font-sans text-slate-900">
          <SchoolProvider
            schoolId={schoolConfig.schoolId}
            schoolName={schoolConfig.schoolName}
            logoUrl={schoolConfig.logoUrl}
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
