export type CalendarDayAvailability = "open" | "full";

export interface RescheduleDateOption {
  id: string;
  year: number;
  monthIndex: number;
  month: string;
  day: number;
  weekday: string;
  label: string;
  slotCount: number;
  availability: CalendarDayAvailability;
}

const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const WEEKDAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function createRescheduleDate(
  year: number,
  monthIndex: number,
  day: number,
  slotCount = 5,
  availability: CalendarDayAvailability = slotCount > 0 ? "open" : "full",
): RescheduleDateOption {
  const date = new Date(year, monthIndex, day);

  return {
    id: `date-${year}-${monthIndex}-${day}`,
    year,
    monthIndex,
    month: MONTH_ABBR[monthIndex],
    day,
    weekday: WEEKDAY_ABBR[date.getDay()],
    label: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "long",
    }),
    slotCount,
    availability,
  };
}

export function resolveRescheduleDateFromIso(
  isoDate: string | null | undefined,
): RescheduleDateOption | null {
  if (!isoDate) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(monthIndex) ||
    !Number.isInteger(day) ||
    monthIndex < 0 ||
    monthIndex > 11 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return createRescheduleDate(year, monthIndex, day);
}

export function mergeRescheduleDates(
  availableDates: readonly RescheduleDateOption[],
  extraDate: RescheduleDateOption | null,
): RescheduleDateOption[] {
  if (!extraDate) return [...availableDates];

  if (availableDates.some((date) => date.id === extraDate.id)) {
    return [...availableDates];
  }

  return [...availableDates, extraDate].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.monthIndex !== b.monthIndex) return a.monthIndex - b.monthIndex;
    return a.day - b.day;
  });
}

export function buildFutureDates(monthsAhead = 12): RescheduleDateOption[] {
  const dates: RescheduleDateOption[] = [];

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + monthsAhead);

  const cursor = new Date(start);

  while (cursor < end) {
    dates.push(
      createRescheduleDate(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
      ),
    );

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function formatLessonHoursLabel(hours: number): string {
  return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
}

export function formatShortLessonHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }

  return `${hours}h`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatClock(hour24: number, minute: number): string {
  const clockPeriod = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${minute.toString().padStart(2, "0")} ${clockPeriod}`;
}

export function formatLessonTimeRange(
  startTime: string,
  hours: number,
): string {
  const match = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(startTime);

  if (!match) {
    return startTime;
  }

  let startHour = Number.parseInt(match[1], 10);
  const startMinute = Number.parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && startHour !== 12) {
    startHour += 12;
  }

  if (period === "AM" && startHour === 12) {
    startHour = 0;
  }

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = startTotalMinutes + hours * 60;

  const endHour24 = Math.floor(endTotalMinutes / 60) % 24;
  const endMinute = endTotalMinutes % 60;

  return `${formatClock(startHour, startMinute)} – ${formatClock(
    endHour24,
    endMinute,
  )}`;
}
