import type { SavedPaymentMethod } from "./card-utils";

const STORAGE_KEY = "saved-payment-method";
export const PAYMENT_METHOD_UPDATED_EVENT = "payment-method-updated";

export const DEFAULT_PAYMENT_METHOD: SavedPaymentMethod = {
  cardholderName: "George Smith",
  last4: "4242",
  expiry: "08/28",
  brand: "Visa",
};

export function getSavedPaymentMethod(
  fallback = DEFAULT_PAYMENT_METHOD,
): SavedPaymentMethod {
  if (typeof window === "undefined") return fallback;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as SavedPaymentMethod;
  } catch {
    return fallback;
  }
}

export function setSavedPaymentMethod(method: SavedPaymentMethod) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(method));
  window.dispatchEvent(
    new CustomEvent<SavedPaymentMethod>(PAYMENT_METHOD_UPDATED_EVENT, {
      detail: method,
    }),
  );
}
