import { DashboardShell } from "@/dashboard/components/DashboardShell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-dvh bg-slate-100">
      <div className="app-frame relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-white">
        <DashboardShell>{children}</DashboardShell>
      </div>
    </div>
  );
}
