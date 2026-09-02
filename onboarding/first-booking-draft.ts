export interface FirstBookingDraft {
  schoolId: string;
  instructorId: string;
  selectedPackageId: string;
  selectedDateId: string;
  selectedTime: string;

  pickupAddress: string;
  pickupSuburb: string;
  pickupPostcode?: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupGooglePlaceId?: string;
}

const STORAGE_KEY = "first-booking-draft";

function isFirstBookingDraft(value: unknown): value is FirstBookingDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<FirstBookingDraft>;

  return (
    typeof draft.schoolId === "string" &&
    typeof draft.instructorId === "string" &&
    typeof draft.selectedPackageId === "string" &&
    typeof draft.selectedDateId === "string" &&
    typeof draft.selectedTime === "string" &&
    typeof draft.pickupAddress === "string" &&
    typeof draft.pickupSuburb === "string" &&
    typeof draft.pickupLatitude === "number" &&
    typeof draft.pickupLongitude === "number"
  );
}

export function saveFirstBookingDraft(draft: FirstBookingDraft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function getFirstBookingDraft(): FirstBookingDraft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isFirstBookingDraft(parsed)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearFirstBookingDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}
