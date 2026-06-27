export type LessonStatus = "upcoming" | "completed" | "cancelled";

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
