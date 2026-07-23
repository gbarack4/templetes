"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Lesson } from "./types";
import { mockDashboardData } from "./mock-data";
import { LessonCard } from "./components/LessonCard";
import { FlowPageHeader } from "./components/FlowPageHeader";

type TabKey = "upcoming" | "completed" | "cancelled";

const tabs: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function parseTab(value: string | null): TabKey {
  if (value === "completed" || value === "cancelled") return value;
  return "upcoming";
}

function matchesLessonQuery(lesson: Lesson, query: string) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  const haystack = [
    lesson.instructor,
    lesson.location,
    lesson.timeRange,
    lesson.weekday,
    lesson.month,
    String(lesson.day),
    lesson.status,
    `${lesson.hours} hours`,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(trimmed);
}

export function BookingsFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    parseTab(searchParams.get("tab")),
  );
  const [query, setQuery] = useState("");
  const [reviewedLessonIds, setReviewedLessonIds] = useState<Set<string>>(
    () => new Set(),
  );

  const filteredLessons = useMemo(() => {
    const source =
      activeTab === "completed"
        ? mockDashboardData.completedLessons
        : activeTab === "cancelled"
          ? mockDashboardData.cancelledLessons
          : mockDashboardData.upcomingLessons;

    return source.filter((lesson) => matchesLessonQuery(lesson, query));
  }, [activeTab, query]);

  function handleReviewSubmit(lessonId: string) {
    setReviewedLessonIds((current) => new Set(current).add(lessonId));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <FlowPageHeader
        title="Bookings"
        onBack={() => router.push("/dashboard")}
      />

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-4">
        <div className="shrink-0">
          <label htmlFor="bookings-search" className="sr-only">
            Search bookings
          </label>
          <input
            id="bookings-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by instructor, date, or location"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <nav className="mt-4 flex shrink-0 border-b border-slate-100">
          {tabs.map(({ key, label }) => {
            const isActive = key === activeTab;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex-1 pb-3 text-sm font-medium transition ${
                  isActive
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          {filteredLessons.length > 0 ? (
            filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isReviewed={reviewedLessonIds.has(lesson.id)}
                onReviewSubmit={handleReviewSubmit}
              />
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
              {query.trim()
                ? "No bookings match your search."
                : "No lessons in this category."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
