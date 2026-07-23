"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import type { DashboardData, Lesson } from "./types";
import { mockDashboardData } from "./mock-data";
import { consumeCancelledLessonId } from "./cancel-booking";
import { consumeBookedLesson } from "./book-lesson";
import { LessonCard } from "./components/LessonCard";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { DEFAULT_STUDENT_AVATAR } from "./student-avatar";
import { useStudentCreditHours } from "./useStudentCreditHours";
import { BellIcon, CalendarIcon } from "./components/icons";
import { useStudent } from "@/shared/hooks/useStudent";

type DashboardProps = Readonly<{
  data?: DashboardData;
}>;

type TabKey = keyof DashboardData["tabCounts"];

const tabs: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const tabBadgeStyles: Record<TabKey, string> = {
  upcoming: "bg-blue-100 text-blue-600",
  completed: "bg-slate-100 text-slate-500",
  cancelled: "bg-red-50 text-red-400",
};

const activeTabStyles: Record<TabKey, string> = {
  upcoming: "border-blue-600 text-blue-600",
  completed: "border-slate-700 text-slate-900",
  cancelled: "border-red-400 text-red-500",
};

const sectionTitles: Record<TabKey, string> = {
  upcoming: "Upcoming Lessons",
  completed: "Completed Lessons",
  cancelled: "Cancelled Lessons",
};

function getLessonsForTab(
  upcoming: Lesson[],
  completed: Lesson[],
  cancelled: Lesson[],
  tab: TabKey,
): Lesson[] {
  if (tab === "completed") return completed;
  if (tab === "cancelled") return cancelled;
  return upcoming;
}

function LessonSection({
  title,
  lessons,
  reviewedLessonIds,
  onReviewSubmit,
}: Readonly<{
  title: string;
  lessons: Lesson[];
  reviewedLessonIds: Set<string>;
  onReviewSubmit: (lessonId: string, rating: number, comment: string) => void;
}>) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <button type="button" className="text-sm font-medium text-blue-600">
          View all
        </button>
      </div>
      <div className="space-y-3">
        {lessons.length > 0 ? (
          lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isReviewed={reviewedLessonIds.has(lesson.id)}
              onReviewSubmit={onReviewSubmit}
            />
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No lessons in this category.
          </p>
        )}
      </div>
    </section>
  );
}

export function Dashboard({ data = mockDashboardData }: DashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { student, loading: studentLoading } = useStudent();
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [upcomingLessons, setUpcomingLessons] = useState(data.upcomingLessons);
  const [cancelledLessons, setCancelledLessons] = useState(
    data.cancelledLessons,
  );
  const [tabCounts, setTabCounts] = useState(data.tabCounts);
  const [availableCreditHours, setAvailableCreditHours] = useStudentCreditHours(
    data.availableCreditHours,
  );
  const [reviewedLessonIds, setReviewedLessonIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [notifications, setNotifications] = useState(data.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [imageError, setImageError] = useState(false);

  const userName =
    student?.name ||
    [student?.user?.firstName, student?.user?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "User";

  const avatarUrl =
    student?.avatarUrl ||
    student?.user?.avatarUrl ||
    data.avatarUrl ||
    DEFAULT_STUDENT_AVATAR;

  const completedLessons = data.completedLessons;
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read,
  ).length;
  const activeLessons = getLessonsForTab(
    upcomingLessons,
    completedLessons,
    cancelledLessons,
    activeTab,
  );

  function handleReviewSubmit(lessonId: string) {
    setReviewedLessonIds((current) => new Set(current).add(lessonId));
  }

  const handleBookLesson = useCallback(
    (lesson: Lesson) => {
      setUpcomingLessons((current) => [lesson, ...current]);
      setAvailableCreditHours((hours) =>
        Math.max(0, hours - Math.min(lesson.hours, hours)),
      );
      setTabCounts((counts) => ({
        ...counts,
        upcoming: counts.upcoming + 1,
      }));
      setActiveTab("upcoming");
    },
    [setAvailableCreditHours],
  );

  const handleCancelLesson = useCallback((lessonId: string) => {
    setUpcomingLessons((current) => {
      const lesson = current.find((item) => item.id === lessonId);
      if (!lesson) return current;

      setCancelledLessons((cancelled) => [
        { ...lesson, status: "cancelled", cancelledBy: "student" },
        ...cancelled,
      ]);
      setTabCounts((counts) => ({
        ...counts,
        upcoming: counts.upcoming - 1,
        cancelled: counts.cancelled + 1,
      }));

      return current.filter((item) => item.id !== lessonId);
    });
  }, []);

  function handleMarkNotificationRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }

  function handleMarkAllNotificationsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const cancelledLessonId = consumeCancelledLessonId();
      if (cancelledLessonId) {
        handleCancelLesson(cancelledLessonId);
      }

      const bookedLesson = consumeBookedLesson();
      if (bookedLesson) {
        handleBookLesson(bookedLesson);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname, handleCancelLesson, handleBookLesson]);

  return (
    <>
      <main className="flex-1 space-y-6 px-5 pb-6 pt-6">
        <section className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src={
                imageError
                  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userName,
                    )}&background=random`
                  : avatarUrl
              }
              alt={`${userName}'s profile`}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white"
              onError={() => setImageError(true)}
              unoptimized
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {studentLoading ? "Loading..." : `Hi, ${userName}!`}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Here&apos;s your lesson overview.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setShowNotifications(true)}
            className="relative shrink-0 rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
          >
            <BellIcon className="h-6 w-6" />
            {unreadNotificationCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
              </span>
            )}
          </button>
        </section>

        <section className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600">You have</p>
            <p className="text-base font-bold text-slate-900">
              {availableCreditHours} Hours
            </p>
            <p className="text-sm text-slate-600">available credit</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/buy-hours")}
            className="shrink-0 text-sm font-medium text-blue-600"
          >
            Buy More Hours
          </button>
        </section>

        <nav className="flex border-b border-slate-100">
          {tabs.map(({ key, label }) => {
            const isActive = key === activeTab;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex flex-1 items-center justify-center gap-1.5 pb-3 text-sm font-medium transition ${
                  isActive
                    ? `border-b-2 ${activeTabStyles[key]}`
                    : "text-slate-400"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tabBadgeStyles[key]}`}
                >
                  {tabCounts[key]}
                </span>
              </button>
            );
          })}
        </nav>

        <LessonSection
          title={sectionTitles[activeTab]}
          lessons={activeLessons}
          reviewedLessonIds={reviewedLessonIds}
          onReviewSubmit={handleReviewSubmit}
        />
      </main>

      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />
      )}
    </>
  );
}
