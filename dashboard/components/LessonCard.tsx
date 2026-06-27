"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getInstructorByName } from "../mock-data";
import type { Lesson } from "../types";
import { InstructorReviewModal } from "./InstructorReviewModal";
import { InstructorProfileSummary } from "./InstructorSearch";
import { MoreVerticalIcon } from "./icons";

type LessonCardProps = Readonly<{
  lesson: Lesson;
  isReviewed?: boolean;
  onReviewSubmit?: (lessonId: string, rating: number, comment: string) => void;
}>;

const actionLabels: Record<Lesson["status"], string> = {
  upcoming: "Reschedule",
  completed: "Leave Review",
  cancelled: "Rebook",
};

const actionButtonStyles: Record<Lesson["status"], string> = {
  upcoming: "bg-blue-600 text-white hover:bg-blue-700",
  completed: "border border-slate-200 text-slate-700 hover:bg-slate-50",
  cancelled: "bg-blue-600 text-white hover:bg-blue-700",
};

const statusBadges: Record<
  Lesson["status"],
  { label: (hours: number) => string; className: string }
> = {
  upcoming: {
    label: (hours) => `${hours} Hours`,
    className: "bg-white text-blue-600",
  },
  completed: {
    label: () => "Completed",
    className: "bg-white text-green-600",
  },
  cancelled: {
    label: () => "Cancelled",
    className: "bg-white text-red-500",
  },
};

function DateBlock({ month, day, weekday }: Pick<Lesson, "month" | "day" | "weekday">) {
  return (
    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-white">
      <span className="text-xs font-semibold tracking-wide text-blue-600">{month}</span>
      <span className="text-2xl font-bold leading-none text-slate-900">{day}</span>
      <span className="text-[10px] font-medium text-slate-900">{weekday}</span>
    </div>
  );
}

export function LessonCard({
  lesson,
  isReviewed = false,
  onReviewSubmit,
}: LessonCardProps) {
  const router = useRouter();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const badge = statusBadges[lesson.status];
  const isUpcoming = lesson.status === "upcoming";
  const isCompleted = lesson.status === "completed";
  const instructor = getInstructorByName(lesson.instructor);
  const lessonLabel = `${lesson.month} ${lesson.day} · ${lesson.weekday} · ${lesson.timeRange}`;

  function handleReviewSubmit(rating: number, comment: string) {
    onReviewSubmit?.(lesson.id, rating, comment);
    setShowReviewModal(false);
  }

  return (
    <article className="relative flex gap-4 rounded-2xl bg-slate-50 p-4">
      {isUpcoming && (
        <button
          type="button"
          aria-label="Cancel booking"
          onClick={() => router.push(`/dashboard/cancel/${lesson.id}`)}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-slate-600"
        >
          <MoreVerticalIcon className="h-5 w-5" />
        </button>
      )}

      <DateBlock month={lesson.month} day={lesson.day} weekday={lesson.weekday} />
      <div className={`flex min-w-0 flex-1 flex-col justify-between gap-3 ${isUpcoming ? "pr-6" : ""}`}>
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-slate-900">{lesson.timeRange}</p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
            >
              {badge.label(lesson.hours)}
            </span>
          </div>
          <div className="mt-2">
            <InstructorProfileSummary instructor={instructor} />
          </div>
        </div>
        {isCompleted && (
          <button
            type="button"
            disabled={isReviewed}
            onClick={() => setShowReviewModal(true)}
            className={`self-end rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              isReviewed
                ? "cursor-default border border-green-200 bg-green-50 text-green-700"
                : actionButtonStyles.completed
            }`}
          >
            {isReviewed ? "Review submitted" : actionLabels.completed}
          </button>
        )}
        {!isCompleted && (
          <button
            type="button"
            onClick={() => {
              if (isUpcoming) {
                router.push(`/dashboard/reschedule/${lesson.id}`);
              }
            }}
            className={`self-end rounded-lg px-4 py-1.5 text-sm font-medium transition ${actionButtonStyles[lesson.status]}`}
          >
            {actionLabels[lesson.status]}
          </button>
        )}
      </div>

      {showReviewModal && (
        <InstructorReviewModal
          instructor={instructor}
          lessonLabel={lessonLabel}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </article>
  );
}
