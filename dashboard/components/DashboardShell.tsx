"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

const HIDDEN_NAV_PREFIXES = [
  "/dashboard/cancel",
  "/dashboard/reschedule",
  "/dashboard/buy-hours",
  "/dashboard/book",
  "/dashboard/instructor",
  "/dashboard/account/change-password",
];

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideNav = HIDDEN_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        data-dashboard-scroll
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
      >
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
