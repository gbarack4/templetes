"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useStudent } from "@/shared/hooks/useStudent";
import { useStudentBookings } from "@/shared/hooks/useStudentBookings";
import { useStudentCreditBalance } from "@/shared/hooks/useStudentCreditBalance";

import { LessonCard } from "./components/LessonCard";
import { BellIcon, CalendarIcon } from "./components/icons";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { mockDashboardData } from "./mock-data";
import { DEFAULT_STUDENT_AVATAR } from "./student-avatar";
import type { DashboardData, Lesson } from "./types";

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
  completed: "bg-[#f9f9f9] text-[#4b5563]",
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

const emptyLessonMessages: Record<TabKey, string> = {
  upcoming: "No upcoming lessons",
  completed: "No completed lessons",
  cancelled: "No cancelled lessons",
};

function LessonSection({
  title,
  emptyMessage,
  lessons,
  reviewedLessonIds,
  onReviewSubmit,
  onViewAll,
}: Readonly<{
  title: string;
  emptyMessage: string;
  lessons: Lesson[];
  reviewedLessonIds: Set<string>;
  onReviewSubmit: (lessonId: string, rating: number, comment: string) => void;
  onViewAll: () => void;
}>) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>

        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-medium text-blue-600"
        >
          View all
        </button>
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain pb-4 [-webkit-overflow-scrolling:touch]">
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
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

export function Dashboard({ data = mockDashboardData }: DashboardProps) {
  const router = useRouter();

  const { student, loading: studentLoading } = useStudent();

  const {
    balanceMinutes,
    loading: isCreditLoading,
    error: creditError,
    refetch: refetchCreditBalance,
  } = useStudentCreditBalance();

  const availableCreditHours =
    balanceMinutes === null ? null : balanceMinutes / 60;

  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  const {
    bookings: activeBookings,
    counts: tabCounts,
    loading: bookingsLoading,
    error: bookingsError,
  } = useStudentBookings({
    status: activeTab,
  });

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

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  function handleReviewSubmit(lessonId: string) {
    setReviewedLessonIds((current) => new Set(current).add(lessonId));
  }

  function handleMarkNotificationRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }

  function handleMarkAllNotificationsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  }

  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pt-6">
        <section className="flex shrink-0 items-start justify-between gap-3">
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
            className="relative shrink-0 rounded-lg bg-[#f9f9f9] p-2 text-[#4b5563] hover:bg-[#f0f0f0]"
          >
            <BellIcon className="h-6 w-6" />

            {unreadNotificationCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
              </span>
            )}
          </button>
        </section>

        <section className="mt-6 flex shrink-0 items-center gap-3 rounded-2xl bg-[#f9f9f9] px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
            <CalendarIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600">You have</p>

            <p className="text-base font-bold text-slate-900">
              {isCreditLoading
                ? "Loading..."
                : availableCreditHours === null
                  ? "Unavailable"
                  : `${Number(availableCreditHours.toFixed(2))} Hours`}
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

        {creditError && (
          <div
            role="alert"
            className="mt-3 shrink-0 rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            <p>{creditError}</p>

            <button
              type="button"
              onClick={() => void refetchCreditBalance()}
              className="mt-2 font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        <nav className="mt-6 flex shrink-0 border-b border-slate-100">
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

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          {bookingsLoading ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Loading bookings...
            </p>
          ) : bookingsError ? (
            <p className="rounded-2xl bg-red-50 py-4 text-center text-sm text-red-600">
              {bookingsError}
            </p>
          ) : (
            <LessonSection
              title={sectionTitles[activeTab]}
              emptyMessage={emptyLessonMessages[activeTab]}
              lessons={activeBookings}
              reviewedLessonIds={reviewedLessonIds}
              onReviewSubmit={handleReviewSubmit}
              onViewAll={() =>
                router.push(`/dashboard/bookings?tab=${activeTab}`)
              }
            />
          )}
        </div>
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
