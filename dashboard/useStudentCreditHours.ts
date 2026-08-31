"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  CREDIT_UPDATED_EVENT,
  getStudentCreditHours,
  setStudentCreditHours,
} from "./student-credit";

export function useStudentCreditHours(fallback: number) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    function handleCreditUpdate() {
      onStoreChange();
    }

    window.addEventListener(CREDIT_UPDATED_EVENT, handleCreditUpdate);

    return () => {
      window.removeEventListener(CREDIT_UPDATED_EVENT, handleCreditUpdate);
    };
  }, []);

  const getSnapshot = useCallback(
    () => getStudentCreditHours(fallback),
    [fallback],
  );

  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const creditHours = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setCreditHours = useCallback(
    (hours: number | ((current: number) => number)) => {
      const current = getStudentCreditHours(fallback);

      const next =
        typeof hours === "function"
          ? Math.max(0, hours(current))
          : Math.max(0, hours);

      setStudentCreditHours(next);
    },
    [fallback],
  );

  return [creditHours, setCreditHours] as const;
}
