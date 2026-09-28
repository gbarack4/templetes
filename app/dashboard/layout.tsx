import { auth } from "@clerk/nextjs/server";

import { DashboardShell } from "@/dashboard/components/DashboardShell";
import { StudentAccessGate } from "@/dashboard/StudentAccessGate";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 await auth.protect({
    unauthenticatedUrl: "/login",
  });

  return (
    <div className="fixed inset-0 bg-slate-100">
      <div className="app-frame relative mx-auto flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden bg-white">
        <StudentAccessGate >  
        <DashboardShell>{children}</DashboardShell>
        </StudentAccessGate>      
      </div>
    </div>
  );
}
