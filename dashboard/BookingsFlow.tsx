"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useStudentBookings } from "@/shared/hooks/useStudentBookings";

import { FlowPageHeader } from "./components/FlowPageHeader";
import { LessonCard } from "./components/LessonCard";

type TabKey = "upcoming" | "completed" | "cancelled";

const tabs: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function parseTab(value: string | null): TabKey {
  if (value === "completed" || value === "cancelled") {
    return value;
  }

  return "upcoming";
}

function getEmptyMessage(activeTab: TabKey, hasQuery: boolean): string {
  if (hasQuery) {
    return "No bookings match your search.";
  }

  if (activeTab === "completed") {
    return "No completed lessons";
  }

  if (activeTab === "cancelled") {
    return "No cancelled lessons";
  }

  return "No upcoming lessons";
}

export function BookingsFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    parseTab(searchParams.get("tab")),
  );
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [reviewedLessonIds, setReviewedLessonIds] = useState<Set<string>>(
    () => new Set(),
  );

  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useStudentBookings({
    status: activeTab,
    query: debouncedQuery,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  function handleReviewSubmit(lessonId: string) {
    setReviewedLessonIds((current) => new Set(current).add(lessonId));
  }

  const emptyMessage = getEmptyMessage(activeTab, debouncedQuery.length > 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <FlowPageHeader
        title="Bookings"
        onBack={() => router.push("/dashboard")}
      />

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4">
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

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain pb-6 [-webkit-overflow-scrolling:touch]">
          {bookingsLoading ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Loading bookings...
            </p>
          ) : bookingsError ? (
            <p className="rounded-2xl bg-red-50 py-4 text-center text-sm text-red-600">
              {bookingsError}
            </p>
          ) : bookings.length > 0 ? (
            bookings.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isReviewed={reviewedLessonIds.has(lesson.id)}
                onReviewSubmit={handleReviewSubmit}
              />
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
              {emptyMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
