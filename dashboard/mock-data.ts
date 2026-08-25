import { DEFAULT_STUDENT_AVATAR } from "./student-avatar";
import type { DashboardData, StudentAccount } from "./types";

export const mockDashboardData: DashboardData = {
  userName: "George",
  avatarUrl: DEFAULT_STUDENT_AVATAR,
  availableCreditHours: 0,
  tabCounts: {
    upcoming: 1,
    completed: 1,
    cancelled: 2,
  },
  upcomingLessons: [
    {
      id: "upcoming-1",
      month: "JUN",
      day: 28,
      weekday: "SAT",
      timeRange: "10:00 AM – 11:30 AM",
      instructor: "Sarah Johnson",
      location: "123 Main Street, Downtown",
      hours: 1.5,
      status: "upcoming",
    },
  ],
  completedLessons: [
    {
      id: "completed-1",
      month: "JUN",
      day: 21,
      weekday: "SAT",
      timeRange: "10:00 AM – 11:30 AM",
      instructor: "Sarah Johnson",
      location: "123 Main Street, Downtown",
      hours: 1.5,
      status: "completed",
    },
  ],
  cancelledLessons: [
    {
      id: "cancelled-1",
      month: "JUN",
      day: 14,
      weekday: "SAT",
      timeRange: "10:00 AM – 11:30 AM",
      instructor: "Sarah Johnson",
      location: "123 Main Street, Downtown",
      hours: 1.5,
      status: "cancelled",
      cancelledBy: "student",
    },
    {
      id: "cancelled-2",
      month: "MAY",
      day: 10,
      weekday: "SAT",
      timeRange: "2:00 PM – 3:30 PM",
      instructor: "Mike Chen",
      location: "789 Pine Road, Eastside",
      hours: 1.5,
      status: "cancelled",
      cancelledBy: "instructor",
    },
  ],
  notifications: [
    {
      id: "notification-1",
      kind: "lesson_reminder",
      title: "Lesson tomorrow",
      message: "Your lesson with Sarah Johnson is tomorrow at 10:00 AM.",
      timeLabel: "2h ago",
      read: false,
    },
    {
      id: "notification-2",
      kind: "lesson_booked",
      title: "Lesson confirmed",
      message: "Your lesson on Jul 2 at 2:00 PM with Sarah Johnson is booked.",
      timeLabel: "Yesterday",
      read: false,
    },
    {
      id: "notification-3",
      kind: "review",
      title: "Rate your lesson",
      message:
        "How was your lesson with Mike Chen on Jun 14? Leave a quick review.",
      timeLabel: "2 days ago",
      read: false,
    },
    {
      id: "notification-4",
      kind: "payment",
      title: "Payment received",
      message: "Your 5-hour package purchase was successful.",
      timeLabel: "3 days ago",
      read: true,
    },
    {
      id: "notification-5",
      kind: "promo",
      title: "Weekend availability",
      message: "New Saturday morning slots are open with Sarah Johnson.",
      timeLabel: "1 week ago",
      read: true,
    },
  ],
};

export const mockStudentAccount: StudentAccount = {
  firstName: "George",
  lastName: "Smith",
  avatarUrl: "/avatars/george.jpg",
  email: "george.smith@email.com",
  phone: "+1 (555) 234-5678",
  address: "42 Maple Street, Springfield",
  learnerPermitNumber: "LP-284719",
  dateOfBirth: "March 15, 2004",
  emergencyContact: {
    name: "Jane Smith",
    phone: "+1 (555) 987-6543",
  },
  notifications: {
    lessonReminders: true,
    emailUpdates: false,
  },
};

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

function buildMockRescheduleDates(): RescheduleDateOption[] {
  const dates: RescheduleDateOption[] = [];
  const year = 2026;

  // Working days: Tue, Wed, Thu, Sat — Jul through Nov
  for (let monthIndex = 6; monthIndex <= 10; monthIndex += 1) {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayOfWeek = new Date(year, monthIndex, day).getDay();
      if (![2, 3, 4, 6].includes(dayOfWeek)) continue;

      // Some working days are fully booked
      if (day % 7 === 3) {
        dates.push(createRescheduleDate(year, monthIndex, day, 0, "full"));
        continue;
      }

      const slotCount =
        dayOfWeek === 6
          ? 8 + (day % 7)
          : dayOfWeek === 2
            ? 3 + (day % 4)
            : 5 + (day % 6);
      dates.push(
        createRescheduleDate(year, monthIndex, day, slotCount, "open"),
      );
    }
  }

  return dates;
}

export const mockRescheduleDates: RescheduleDateOption[] =
  buildMockRescheduleDates();

/** Resolve a YYYY-MM-DD value from Classic/search into a calendar date option. */
export function resolveRescheduleDateFromIso(
  isoDate: string | null | undefined,
  availableDates: readonly RescheduleDateOption[] = mockRescheduleDates,
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

  const id = `date-${year}-${monthIndex}-${day}`;
  return (
    availableDates.find((date) => date.id === id) ??
    createRescheduleDate(year, monthIndex, day)
  );
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

export const mockRescheduleTimeSlots = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
];

export const mockLessonDurations = [1, 1.5, 2] as const;

export function buildLessonDurationOptions(maxHours: number): number[] {
  const options: number[] = [];

  for (let hours = 1; hours <= maxHours + 0.001; hours += 0.5) {
    options.push(Math.round(hours * 10) / 10);
  }

  return options;
}

export function formatLessonHoursLabel(hours: number): string {
  return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
}

export function formatShortLessonHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return Number.isInteger(hours) ? `${hours}h` : `${hours}h`;
}

/** Display titles for duration options in the booking package picker. */
export function getLessonPackageTitle(hours: number): string {
  const titles: Record<number, string> = {
    1: "First Lesson Intro",
    1.5: "Standard Lesson",
    2: "Highway Practice",
    2.5: "Refresher Duo",
    3: "Extended Practice",
    3.5: "Test Ready Package",
    4: "Beginner 5-Pack",
  };

  return titles[hours] ?? formatLessonHoursLabel(hours);
}

/** Parse labels like "1 Hour" / "1.5 Hours" from Modern template search. */
export function parseLessonDurationLabel(
  label: string | null | undefined,
): number | null {
  if (!label) return null;

  const match = label.trim().match(/^(\d+(?:\.\d+)?)\s*hours?$/i);
  if (!match) return null;

  const hours = Number(match[1]);
  return Number.isFinite(hours) && hours > 0 ? hours : null;
}

export const LESSON_HOUR_RATE = 60;

export function calculateLessonPayment(
  hours: number,
  availableCreditHours: number,
) {
  const creditHoursUsed = Math.min(hours, availableCreditHours);
  const payableHours = Math.max(0, hours - creditHoursUsed);
  const subtotal = hours * LESSON_HOUR_RATE;
  const creditDiscount = creditHoursUsed * LESSON_HOUR_RATE;
  const totalDue = payableHours * LESSON_HOUR_RATE;

  return {
    creditHoursUsed,
    payableHours,
    subtotal,
    creditDiscount,
    totalDue,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export interface RecentPayment {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  amount: number;
  status: "paid" | "refunded";
}

export const mockRecentPayments: RecentPayment[] = [
  {
    id: "payment-1",
    title: "Lesson with Sarah Johnson",
    description: "1.5 hours · Jun 28, 10:00 AM",
    dateLabel: "Jun 26, 2026",
    amount: 90,
    status: "paid",
  },
  {
    id: "payment-2",
    title: "5-hour package",
    description: "Credit top-up",
    dateLabel: "Jun 18, 2026",
    amount: 275,
    status: "paid",
  },
  {
    id: "payment-3",
    title: "Lesson with Mike Chen",
    description: "1.5 hours · Jun 14, 2:00 PM",
    dateLabel: "Jun 12, 2026",
    amount: 87,
    status: "paid",
  },
  {
    id: "payment-4",
    title: "Lesson cancellation refund",
    description: "Sarah Johnson · May 10",
    dateLabel: "May 9, 2026",
    amount: 90,
    status: "refunded",
  },
];

export interface HourPackage {
  id: string;
  hours: number;
  price: number;
  label: string;
  badge?: string;
  savingsLabel?: string;
  pricePerHour: number;
}

export const mockHourPackages: HourPackage[] = [
  {
    id: "pkg-5",
    hours: 5,
    price: 275,
    label: "5 Hours",
    savingsLabel: "Save $25",
    pricePerHour: 55,
  },
  {
    id: "pkg-10",
    hours: 10,
    price: 520,
    label: "10 Hours",
    badge: "Popular",
    savingsLabel: "Save $80",
    pricePerHour: 52,
  },
  {
    id: "pkg-20",
    hours: 20,
    price: 980,
    label: "20 Hours",
    badge: "Best value",
    savingsLabel: "Save $220",
    pricePerHour: 49,
  },
];

export function formatLessonTimeRange(
  startTime: string,
  hours: number,
): string {
  const match = startTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return startTime;

  let startHour = Number.parseInt(match[1], 10);
  const startMinute = Number.parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && startHour !== 12) startHour += 12;
  if (period === "AM" && startHour === 12) startHour = 0;

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = startTotalMinutes + hours * 60;
  const endHour24 = Math.floor(endTotalMinutes / 60) % 24;
  const endMinute = endTotalMinutes % 60;

  function formatClock(hour24: number, minute: number) {
    const clockPeriod = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${clockPeriod}`;
  }

  return `${formatClock(startHour, startMinute)} – ${formatClock(endHour24, endMinute)}`;
}

export interface InstructorOption {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;
  location: string;
  rating: number;
  reviewCount: number;
  lessonsCompleted: number;
  pricePerHour: number;
}

export const mockInstructors: InstructorOption[] = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    initials: "SJ",
    avatarUrl: "/avatars/instructors/sarah-johnson.jpg",
    location: "123 Main Street, Downtown",
    rating: 4.9,
    reviewCount: 128,
    lessonsCompleted: 840,
    pricePerHour: 60,
  },
  {
    id: "mike-chen",
    name: "Mike Chen",
    initials: "MC",
    avatarUrl: "/avatars/instructors/mike-chen.jpg",
    location: "456 Oak Avenue, Westside",
    rating: 4.8,
    reviewCount: 96,
    lessonsCompleted: 620,
    pricePerHour: 58,
  },
  {
    id: "emma-williams",
    name: "Emma Williams",
    initials: "EW",
    avatarUrl: "/avatars/instructors/emma-williams.jpg",
    location: "789 Pine Road, Eastside",
    rating: 5.0,
    reviewCount: 74,
    lessonsCompleted: 510,
    pricePerHour: 62,
  },
];

export function getInstructorByName(name: string) {
  return (
    mockInstructors.find((instructor) => instructor.name === name) ??
    mockInstructors[0]
  );
}

export function getLessonById(lessonId: string) {
  const allLessons = [
    ...mockDashboardData.upcomingLessons,
    ...mockDashboardData.completedLessons,
    ...mockDashboardData.cancelledLessons,
  ];

  return allLessons.find((lesson) => lesson.id === lessonId) ?? null;
}
