import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { SiteLoaderGate } from "@/components/SiteLoaderGate";
import { SchoolProvider } from "@/dashboard/SchoolContext";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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

async function getSchoolId(): Promise<string> {
  try {
    const headerList = await headers();
    const host = headerList.get("host") || "";
    const domain = host.split(".")[0];

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/websites/${domain}`,
      { cache: "no-store" },
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data?.schoolId || "";
  } catch {
    return "";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schoolId = await getSchoolId();

  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} antialiased`}>
        <body className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
          <SchoolProvider schoolId={schoolId}>
            <SiteLoaderGate>{children}</SiteLoaderGate>
          </SchoolProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
