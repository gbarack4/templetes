const STORAGE_KEY = "student-credit-hours";
export const CREDIT_UPDATED_EVENT = "student-credit-updated";

export function getStudentCreditHours(fallback: number): number {
  if (typeof window === "undefined") return fallback;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    sessionStorage.setItem(STORAGE_KEY, String(fallback));
    return fallback;
  }

  const hours = Number.parseFloat(raw);
  return Number.isFinite(hours) ? hours : fallback;
}

export function setStudentCreditHours(hours: number) {
  const normalized = Math.max(0, hours);
  sessionStorage.setItem(STORAGE_KEY, String(normalized));
  window.dispatchEvent(
    new CustomEvent<number>(CREDIT_UPDATED_EVENT, { detail: normalized }),
  );
}
