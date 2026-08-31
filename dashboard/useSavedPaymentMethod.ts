"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import type { SavedPaymentMethod } from "./card-utils";
import {
  DEFAULT_PAYMENT_METHOD,
  getSavedPaymentMethod,
  PAYMENT_METHOD_UPDATED_EVENT,
  setSavedPaymentMethod,
} from "./payment-method";

export function useSavedPaymentMethod(fallback = DEFAULT_PAYMENT_METHOD) {
  const pathname = usePathname();

  const [paymentMethod, setPaymentMethod] = useState(fallback);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPaymentMethod(getSavedPaymentMethod(fallback));
    }, 0);

    function handlePaymentMethodUpdate(event: Event) {
      setPaymentMethod((event as CustomEvent<SavedPaymentMethod>).detail);
    }

    window.addEventListener(
      PAYMENT_METHOD_UPDATED_EVENT,
      handlePaymentMethodUpdate,
    );

    return () => {
      window.clearTimeout(timeoutId);

      window.removeEventListener(
        PAYMENT_METHOD_UPDATED_EVENT,
        handlePaymentMethodUpdate,
      );
    };
  }, [fallback, pathname]);

  const updatePaymentMethod = useCallback((method: SavedPaymentMethod) => {
    setSavedPaymentMethod(method);
    setPaymentMethod(method);
  }, []);

  return [paymentMethod, updatePaymentMethod] as const;
}
