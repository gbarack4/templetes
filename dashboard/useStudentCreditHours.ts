"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CREDIT_UPDATED_EVENT,
  getStudentCreditHours,
  setStudentCreditHours,
} from "./student-credit";

export function useStudentCreditHours(fallback: number) {
  const pathname = usePathname();
  const [creditHours, setCreditHoursState] = useState(fallback);

  useEffect(() => {
    setCreditHoursState(getStudentCreditHours(fallback));

    function handleCreditUpdate(event: Event) {
      setCreditHoursState((event as CustomEvent<number>).detail);
    }

    window.addEventListener(CREDIT_UPDATED_EVENT, handleCreditUpdate);
    return () => window.removeEventListener(CREDIT_UPDATED_EVENT, handleCreditUpdate);
  }, [fallback, pathname]);

  const setCreditHours = useCallback((hours: number | ((current: number) => number)) => {
    setCreditHoursState((current) => {
      const next =
        typeof hours === "function"
          ? Math.max(0, hours(current))
          : Math.max(0, hours);
      setStudentCreditHours(next);
      return next;
    });
  }, []);

  return [creditHours, setCreditHours] as const;
}
