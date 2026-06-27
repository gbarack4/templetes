"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

const HIDDEN_NAV_PREFIXES = [
  "/dashboard/cancel",
  "/dashboard/reschedule",
  "/dashboard/buy-hours",
  "/dashboard/book",
];

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideNav = HIDDEN_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}
