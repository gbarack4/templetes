export type HoursPayment = {
  purchaseId: string;
  packageName: string;
  purchasedMinutes: number;
  amount: string;
  currency: string;
  purchaseStatus: string;
  clientSecret: string | null;
  publishableKey: string;
  intentStatus: string;
};
export type PurchaseAttempt = { packageId: string; requestId: string };
export type PaymentHistoryItem = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string | null;
  packageName: string;
  purchasedMinutes: number;
};
export type PaymentHistory = {
  payments: PaymentHistoryItem[];
  nextOffset: number | null;
};

export async function paymentRequest<T>(
  schoolId: string,
  token: string | null,
  path: string,
  body?: unknown,
): Promise<T> {
  if (!token) throw new Error("Please sign in again to continue.");
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Payment service is not configured.");
  const response = await fetch(`${base}/payments/school/${schoolId}/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-school-id": schoolId,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const message =
      data && typeof data === "object" && "message" in data
        ? data.message
        : null;
    throw new Error(
      typeof message === "string"
        ? message
        : "Unable to complete the request. Please try again.",
    );
  }
  return response.json() as Promise<T>;
}

export function formatPaymentAmount(amount: string, currency = "aud") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(amount));
}

export function formatPaymentDate(value: string | null) {
  if (!value) return "Date unavailable";
  const normalized = value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-AU");
}
