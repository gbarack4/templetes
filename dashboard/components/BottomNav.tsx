"use client";

import { useEffect, useRef, useState } from "react";
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
    lastScrollY.current = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;
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

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed bottom-0 left-1/2 z-40 w-full max-w-md border-t border-slate-100 bg-white transition-transform duration-300 ease-out ${
        visible
          ? "translate-x-[-50%] translate-y-0"
          : "translate-x-[-50%] translate-y-full"
      }`}
    >
      <div className="relative flex px-2 py-2">
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
