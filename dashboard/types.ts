export type LessonStatus = "upcoming" | "completed" | "cancelled";
export type LessonCancelledBy = "student" | "instructor";

export interface LessonInstructor {
  id: string;
  name: string;
  avatarUrl: string | null;
  pricePerHour: number | null;
}

export interface StudentBookingApiInstructor {
  id: string;
  name: string;
  avatarUrl: string | null;
  pricePerHour: string | null;
}

export interface StudentBookingApiItem {
  id: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  bookingSource: string | null;
  pickupAddress: string | null;
  pickupSuburb: string | null;
  pickupPostcode: string | null;
  cancelledAt: string | null;
  cancelledByUserId: string | null;
  instructor: StudentBookingApiInstructor;
}

export interface StudentBookingsResponse {
  timezone: string;
  counts: {
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  bookings: StudentBookingApiItem[];
}

export interface Lesson {
  id: string;
  month: string;
  day: number;
  weekday: string;
  timeRange: string;

  /**
   * Real bookings use LessonInstructor.
   * string is temporarily supported for legacy mock data.
   */
  instructor: LessonInstructor | string;

  location: string;
  hours: number;
  status: LessonStatus;
  cancelledBy?: LessonCancelledBy;
}

export interface DashboardData {
  userName: string;
  avatarUrl: string;
  availableCreditHours: number;
  tabCounts: {
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  upcomingLessons: Lesson[];
  completedLessons: Lesson[];
  cancelledLessons: Lesson[];
  notifications: AppNotification[];
}

export type NotificationKind =
  | "lesson_reminder"
  | "lesson_booked"
  | "payment"
  | "review"
  | "promo";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  timeLabel: string;
  read: boolean;
}

export interface StudentAccount {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  email: string;
  phone: string;
  address: string;
  learnerPermitNumber: string;
  dateOfBirth: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  notifications: {
    lessonReminders: boolean;
    emailUpdates: boolean;
  };
}
