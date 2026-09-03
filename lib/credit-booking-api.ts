import type {
  CreateCreditBookingInput,
  CreditAvailabilityDay,
  CreditAvailabilitySearch,
  CreditBalance,
  CreditBookingResult,
  CreditInstructor,
  CreditSlot,
  CreditSlotSearch,
} from "@/types/credit-booking";

export class CreditApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CreditApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("The server returned an invalid booking response.");
  }

  return value;
}

function datetime(value: unknown): string {
  const text = requiredString(value).trim();

  const normalized = text
    .replace(" ", "T")
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2")
    .replace(/([+-]\d{2})$/, "$1:00");

  const timestamp = Date.parse(normalized);

  if (!Number.isFinite(timestamp)) {
    throw new TypeError("The server returned an invalid booking time.");
  }

  return new Date(timestamp).toISOString();
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function parseCreditBalance(value: unknown): CreditBalance {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.balanceMinutes) ||
    typeof value.balanceMinutes !== "number" ||
    value.balanceMinutes < 0
  ) {
    throw new Error("The server returned an invalid credit balance.");
  }

  return {
    balanceMinutes: value.balanceMinutes,
  };
}

function errorMessage(value: unknown, fallback: string): string {
  if (!isRecord(value)) {
    return fallback;
  }

  if (typeof value.message === "string") {
    return value.message;
  }

  if (Array.isArray(value.message)) {
    const messages = value.message.filter(
      (item): item is string => typeof item === "string",
    );

    if (messages.length) {
      return messages.join(" ");
    }
  }

  return fallback;
}

async function request(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("The API URL is not configured.");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    cache: "no-store",
    ...options,
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new CreditApiError(
      errorMessage(
        body,
        `Request failed (${response.status}). Please try again.`,
      ),
      response.status,
    );
  }

  return body;
}

function authorization(token: string): Record<string, string> {
  if (!token) {
    throw new Error("Please sign in to book a lesson.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function parseCreditSlot(
  value: unknown,
  instructorId: string,
  durationMinutes: number,
): CreditSlot {
  if (!isRecord(value)) {
    throw new Error("The server returned an invalid slot.");
  }

  const slot: CreditSlot = {
    instructorId: requiredString(value.instructorId),
    startDatetime: datetime(value.startDatetime),
    endDatetime: datetime(value.endDatetime),
    startTime: requiredString(value.startTime),
    endTime: requiredString(value.endTime),
  };

  const actualDuration =
    Date.parse(slot.endDatetime) - Date.parse(slot.startDatetime);

  if (
    slot.instructorId !== instructorId ||
    actualDuration !== durationMinutes * 60_000
  ) {
    throw new Error(
      "The server returned a slot for a different instructor or duration.",
    );
  }

  return slot;
}

function parseCreditAvailabilityDay(
  value: unknown,
  search: CreditAvailabilitySearch,
): CreditAvailabilityDay {
  if (!isRecord(value)) {
    throw new Error("The server returned an invalid credit availability day.");
  }

  const date = requiredString(value.date);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !date.startsWith(`${search.month}-`)
  ) {
    throw new Error("The server returned an invalid credit availability date.");
  }

  if (!Array.isArray(value.slots)) {
    throw new TypeError(
      "The server returned an invalid credit availability slot list.",
    );
  }

  const slots = value.slots.map((slot) =>
    parseCreditSlot(slot, search.instructorId, search.durationMinutes),
  );

  if (
    typeof value.slotCount !== "number" ||
    !Number.isSafeInteger(value.slotCount) ||
    value.slotCount < 0 ||
    value.slotCount !== slots.length
  ) {
    throw new Error(
      "The server returned an invalid credit availability slot count.",
    );
  }

  return {
    date,
    slotCount: value.slotCount,
    slots,
  };
}

export async function fetchStudentCreditBalance(
  schoolId: string,
  token: string,
  signal?: AbortSignal,
): Promise<CreditBalance> {
  return parseCreditBalance(
    await request(`/credits/school/${encodeURIComponent(schoolId)}/balance`, {
      headers: authorization(token),
      signal,
    }),
  );
}

export async function fetchCreditInstructors(
  schoolId: string,
  suburb: string,
  date: string,
  signal?: AbortSignal,
): Promise<CreditInstructor[]> {
  const query = new URLSearchParams({
    suburb,
    preferredDate: date,
  });

  const data = await request(
    `/public/schools/${encodeURIComponent(schoolId)}/instructors?${query}`,
    {
      signal,
    },
  );

  if (!Array.isArray(data)) {
    throw new TypeError("The server returned an invalid instructor list.");
  }

  return data.map((item: unknown) => {
    if (!isRecord(item)) {
      throw new Error("The server returned an invalid instructor.");
    }

    return {
      id: requiredString(item.id),
      name: requiredString(item.name),
      avatarUrl: nullableString(item.avatarUrl),
      suburb: nullableString(item.suburb),
    };
  });
}

export async function fetchCreditSlots(
  schoolId: string,
  token: string,
  search: CreditSlotSearch,
  signal?: AbortSignal,
): Promise<CreditSlot[]> {
  const query = new URLSearchParams({
    instructorId: search.instructorId,
    date: search.date,
    suburb: search.suburb,
    durationMinutes: String(search.durationMinutes),
  });

  const data = await request(
    `/bookings/school/${encodeURIComponent(schoolId)}/credit-slots?${query}`,
    {
      headers: authorization(token),
      signal,
    },
  );

  if (!Array.isArray(data)) {
    throw new TypeError("The server returned an invalid slot list.");
  }

  const slots = data.map((item: unknown) =>
    parseCreditSlot(item, search.instructorId, search.durationMinutes),
  );

  return [
    ...new Map(slots.map((slot) => [slot.startDatetime, slot])).values(),
  ].sort((a, b) => Date.parse(a.startDatetime) - Date.parse(b.startDatetime));
}

export async function fetchCreditAvailability(
  schoolId: string,
  token: string,
  search: CreditAvailabilitySearch,
  signal?: AbortSignal,
): Promise<CreditAvailabilityDay[]> {
  const query = new URLSearchParams({
    instructorId: search.instructorId,
    month: search.month,
    durationMinutes: String(search.durationMinutes),
  });

  const data = await request(
    `/bookings/school/${encodeURIComponent(
      schoolId,
    )}/credit-availability?${query}`,
    {
      headers: authorization(token),
      signal,
    },
  );

  if (!Array.isArray(data)) {
    throw new TypeError(
      "The server returned an invalid credit availability response.",
    );
  }

  return data
    .map((item: unknown) => parseCreditAvailabilityDay(item, search))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function createCreditBooking(
  schoolId: string,
  token: string,
  input: CreateCreditBookingInput,
): Promise<CreditBookingResult> {
  const data = await request(
    `/bookings/school/${encodeURIComponent(schoolId)}/credit`,
    {
      method: "POST",
      signal: AbortSignal.timeout(30_000),
      headers: {
        ...authorization(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const balance = parseCreditBalance(data);

  if (!isRecord(data) || !isRecord(data.booking)) {
    throw new Error("The server did not return a booking.");
  }

  const raw = data.booking;

  const booking = {
    id: requiredString(raw.id),
    schoolId: requiredString(raw.schoolId),
    instructorId: requiredString(raw.instructorId),
    startDatetime: datetime(raw.startDatetime),
    endDatetime: datetime(raw.endDatetime),
    pickupSuburb: requiredString(raw.pickupSuburb),
    status: "confirmed" as const,
  };

  if (
    raw.status !== "confirmed" ||
    booking.schoolId !== schoolId ||
    booking.instructorId !== input.instructorId ||
    booking.pickupSuburb !== input.pickupSuburb ||
    Date.parse(booking.startDatetime) !== Date.parse(input.startDatetime) ||
    Date.parse(booking.endDatetime) - Date.parse(booking.startDatetime) !==
      input.durationMinutes * 60_000
  ) {
    throw new Error(
      "The returned booking does not match the confirmed lesson. Retry to check its status.",
    );
  }

  return {
    booking,
    ...balance,
  };
}

export function creditDurationOptions(balanceMinutes: number | null): number[] {
  if (balanceMinutes === null || balanceMinutes < 60) {
    return [];
  }

  const maximum = Math.min(180, balanceMinutes);

  return Array.from(
    {
      length: Math.floor((maximum - 60) / 15) + 1,
    },
    (_, index) => 60 + index * 15,
  );
}

export function formatCreditMinutes(minutes: number): string {
  const hours = minutes / 60;

  return `${Number(hours.toFixed(2))} ${hours === 1 ? "hour" : "hours"}`;
}

export function formatCreditDate(date: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
