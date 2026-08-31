export interface FirstBookingDraft {
  schoolId: string;
  instructorId: string;
  selectedPackageId: string;
  selectedDateId: string;
  selectedTime: string;
  pickupAddress: string;
}

const STORAGE_KEY = "first-booking-draft";

export function saveFirstBookingDraft(draft: FirstBookingDraft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function getFirstBookingDraft(): FirstBookingDraft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as FirstBookingDraft;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearFirstBookingDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}
