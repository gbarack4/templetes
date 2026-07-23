import { auth } from "@clerk/nextjs/server";
import { DashboardShell } from "@/dashboard/components/DashboardShell";
import { StudentSync } from "@/dashboard/StudentSync";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect({
    unauthenticatedUrl: "/login",
  });

  return (
    <div className="h-dvh bg-slate-100">
      <div className="app-frame relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-white">
        <StudentSync />
        <DashboardShell>{children}</DashboardShell>
      </div>
    </div>
  );
}
