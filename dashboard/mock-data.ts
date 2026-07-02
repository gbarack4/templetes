import type { DashboardData, StudentAccount } from "./types";

export const mockDashboardData: DashboardData = {
  userName: "George",
  avatarUrl: "/avatars/george.jpg",
  availableCreditHours: 0,
  tabCounts: {
    upcoming: 2,
    completed: 6,
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
    {
      id: "upcoming-2",
      month: "JUL",
      day: 2,
      weekday: "WED",
      timeRange: "2:00 PM – 3:30 PM",
      instructor: "Sarah Johnson",
      location: "456 Oak Avenue, Westside",
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
    {
      id: "completed-2",
      month: "JUN",
      day: 14,
      weekday: "SAT",
      timeRange: "2:00 PM – 3:30 PM",
      instructor: "Mike Chen",
      location: "456 Oak Avenue, Westside",
      hours: 1.5,
      status: "completed",
    },
    {
      id: "completed-3",
      month: "JUN",
      day: 7,
      weekday: "SAT",
      timeRange: "10:00 AM – 11:30 AM",
      instructor: "Sarah Johnson",
      location: "123 Main Street, Downtown",
      hours: 1.5,
      status: "completed",
    },
    {
      id: "completed-4",
      month: "MAY",
      day: 31,
      weekday: "SAT",
      timeRange: "2:00 PM – 3:30 PM",
      instructor: "Mike Chen",
      location: "789 Pine Road, Eastside",
      hours: 1.5,
      status: "completed",
    },
    {
      id: "completed-5",
      month: "MAY",
      day: 24,
      weekday: "SAT",
      timeRange: "10:00 AM – 11:30 AM",
      instructor: "Sarah Johnson",
      location: "123 Main Street, Downtown",
      hours: 1.5,
      status: "completed",
    },
    {
      id: "completed-6",
      month: "MAY",
      day: 17,
      weekday: "SAT",
      timeRange: "2:00 PM – 3:30 PM",
      instructor: "Sarah Johnson",
      location: "456 Oak Avenue, Westside",
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
      message: "How was your lesson with Mike Chen on Jun 14? Leave a quick review.",
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

export interface RescheduleDateOption {
  id: string;
  year: number;
  monthIndex: number;
  month: string;
  day: number;
  weekday: string;
  label: string;
}

const MONTH_ABBR = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

const WEEKDAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function createRescheduleDate(year: number, monthIndex: number, day: number): RescheduleDateOption {
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
  };
}

function buildMockRescheduleDates(): RescheduleDateOption[] {
  const dates: RescheduleDateOption[] = [];
  const year = 2026;

  // Available lesson days: Tue, Wed, Thu, Sat — Jul through Nov
  for (let monthIndex = 6; monthIndex <= 10; monthIndex += 1) {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayOfWeek = new Date(year, monthIndex, day).getDay();
      if ([2, 3, 4, 6].includes(dayOfWeek)) {
        dates.push(createRescheduleDate(year, monthIndex, day));
      }
    }
  }

  return dates;
}

export const mockRescheduleDates: RescheduleDateOption[] = buildMockRescheduleDates();

export function buildFutureDates(monthsAhead = 12): RescheduleDateOption[] {
  const dates: RescheduleDateOption[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + monthsAhead);

  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(
      createRescheduleDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()),
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export const mockRescheduleTimeSlots = [
  "9:00 AM",
  "10:00 AM",
  "2:00 PM",
  "4:00 PM",
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

export function formatLessonTimeRange(startTime: string, hours: number): string {
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
  location: string;
  rating: number;
  reviewCount: number;
  lessonsCompleted: number;
}

export const mockInstructors: InstructorOption[] = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    initials: "SJ",
    location: "123 Main Street, Downtown",
    rating: 4.9,
    reviewCount: 128,
    lessonsCompleted: 840,
  },
  {
    id: "mike-chen",
    name: "Mike Chen",
    initials: "MC",
    location: "456 Oak Avenue, Westside",
    rating: 4.8,
    reviewCount: 96,
    lessonsCompleted: 620,
  },
  {
    id: "emma-williams",
    name: "Emma Williams",
    initials: "EW",
    location: "789 Pine Road, Eastside",
    rating: 5.0,
    reviewCount: 74,
    lessonsCompleted: 510,
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
