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
  const [paymentMethod, setPaymentMethodState] = useState(fallback);

  useEffect(() => {
    setPaymentMethodState(getSavedPaymentMethod(fallback));

    function handlePaymentMethodUpdate(event: Event) {
      setPaymentMethodState((event as CustomEvent<SavedPaymentMethod>).detail);
    }

    window.addEventListener(PAYMENT_METHOD_UPDATED_EVENT, handlePaymentMethodUpdate);
    return () =>
      window.removeEventListener(PAYMENT_METHOD_UPDATED_EVENT, handlePaymentMethodUpdate);
  }, [fallback, pathname]);

  const setPaymentMethod = useCallback((method: SavedPaymentMethod) => {
    setSavedPaymentMethod(method);
    setPaymentMethodState(method);
  }, []);

  return [paymentMethod, setPaymentMethod] as const;
}
