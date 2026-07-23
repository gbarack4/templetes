import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { DashboardShell } from "@/dashboard/components/DashboardShell";
import { StudentSync } from "@/dashboard/StudentSync";

function isLocalDev(host: string) {
  return host.includes("localhost") || host.startsWith("127.0.0.1");
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = (await headers()).get("host") || "";
  if (!isLocalDev(host)) {
    await auth.protect({
      unauthenticatedUrl: "/login",
    });
  }

  return (
    <div className="h-dvh bg-slate-100">
      <div className="app-frame relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-white">
        <StudentSync />
        <DashboardShell>{children}</DashboardShell>
      </div>
    </div>
  );
}
