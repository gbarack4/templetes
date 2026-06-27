const STORAGE_KEY = "purchased-hours";

export function markHoursPurchased(hours: number) {
  sessionStorage.setItem(STORAGE_KEY, String(hours));
}

export function consumePurchasedHours(): number | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(STORAGE_KEY);

  const hours = Number.parseFloat(raw);
  return Number.isFinite(hours) ? hours : null;
}
