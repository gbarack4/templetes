"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

const HIDDEN_NAV_PREFIXES = [
  "/dashboard/cancel",
  "/dashboard/reschedule",
  "/dashboard/buy-hours",
  "/dashboard/book",
  "/dashboard/instructor",
  "/dashboard/account",
  "/dashboard/bookings",
];

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideNav = HIDDEN_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isHomeDashboard = pathname === "/dashboard";
  const isBookingsPage = pathname.startsWith("/dashboard/bookings");
  const useFixedLayout = isHomeDashboard || isBookingsPage;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        data-dashboard-scroll
        className={`min-h-0 flex-1 overscroll-y-contain [-webkit-overflow-scrolling:touch] ${
          useFixedLayout
            ? "flex flex-col overflow-hidden"
            : "overflow-y-auto"
        }`}
      >
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
