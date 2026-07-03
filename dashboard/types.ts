export type LessonStatus = "upcoming" | "completed" | "cancelled";
export type LessonCancelledBy = "student" | "instructor";

export interface Lesson {
  id: string;
  month: string;
  day: number;
  weekday: string;
  timeRange: string;
  instructor: string;
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
