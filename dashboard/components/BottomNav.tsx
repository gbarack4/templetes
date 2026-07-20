"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  WalletIcon,
  CreditCardIcon,
  ProfileIcon,
} from "./icons";

const navItems = [
  { label: "Dashboard", icon: HomeIcon, href: "/dashboard" },
  { label: "Book Lesson", icon: WalletIcon, href: "/dashboard/book" },
  { label: "Payments", icon: CreditCardIcon, href: "/dashboard/payments" },
  { label: "Account", icon: ProfileIcon, href: "/dashboard/account" },
] as const;

function getActiveNavIndex(pathname: string) {
  const exactMatch = navItems.findIndex((item) => item.href === pathname);
  if (exactMatch >= 0) return exactMatch;

  if (
    pathname.startsWith("/dashboard/cancel") ||
    pathname.startsWith("/dashboard/reschedule")
  ) {
    return 0;
  }

  return 0;
}

const SCROLL_THRESHOLD = 8;
const TOP_OFFSET = 24;

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const activeIndex = getActiveNavIndex(pathname);
  const itemWidth = `calc((100% - 16px) / ${navItems.length})`;
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>("[data-dashboard-scroll]");
    if (!scroller) return;

    lastScrollY.current = scroller.scrollTop;

    function onScroll() {
      if (!scroller) return;
      const currentY = scroller.scrollTop;
      const delta = currentY - lastScrollY.current;

      if (currentY <= TOP_OFFSET) {
        setVisible(true);
      } else if (delta > SCROLL_THRESHOLD) {
        setVisible(false);
      } else if (delta < -SCROLL_THRESHOLD) {
        setVisible(true);
      }

      lastScrollY.current = currentY;
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <nav
      className={`shrink-0 border-t border-slate-100 bg-white transition-[margin] duration-300 ease-out ${
        visible ? "mb-0" : "-mb-[var(--bottom-nav-height,4.25rem)]"
      }`}
      style={
        {
          "--bottom-nav-height": "4.25rem",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        } as CSSProperties
      }
    >
      <div
        className={`relative flex px-2 py-2 transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          aria-hidden
          className="absolute inset-y-2 rounded-xl bg-slate-100 transition-transform duration-200 ease-out"
          style={{
            width: itemWidth,
            left: "8px",
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {navItems.map(({ label, icon: Icon, href }, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={label}
              type="button"
              onClick={() => router.push(href)}
              className={`relative z-10 flex flex-1 flex-col items-center gap-1 px-1 py-1.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
