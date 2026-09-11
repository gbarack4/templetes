"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

import { ButtonSpinner } from "@/components/ButtonSpinner";
import { useStudentReview } from "@/shared/hooks/useStudentReview";
import type { InstructorOption } from "@/types/instructor";

import type { Lesson, LessonInstructor } from "../types";
import { InstructorProfileSummary } from "./InstructorSearch";
import { InstructorReviewModal } from "./InstructorReviewModal";
import { XCircleIcon } from "./icons";

type LessonCardProps = Readonly<{
  lesson: Lesson;
}>;

const actionLabels = {
  upcoming: "Reschedule",
  completed: "Leave Review",
} as const;

const actionButtonStyles = {
  upcoming: "bg-blue-600 text-white hover:bg-blue-700",
  completed: "border border-slate-200 text-[#4b5563] hover:bg-slate-50",
} as const;

const BUTTON_LOADING_MS = 2000;

const statusBadges: Record<
  Lesson["status"],
  {
    label: (hours: number) => string;
    className: string;
  }
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

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isLessonInstructor(
  instructor: Lesson["instructor"],
): instructor is LessonInstructor {
  return typeof instructor !== "string";
}

function getInstructorOption(lesson: Lesson): InstructorOption {
  if (isLessonInstructor(lesson.instructor)) {
    return {
      id: lesson.instructor.id,
      name: lesson.instructor.name,
      initials: getInitials(lesson.instructor.name),
      avatarUrl: lesson.instructor.avatarUrl ?? "",
      location: lesson.location,
      pricePerHour: lesson.instructor.pricePerHour,
    };
  }

  return {
    id: "",
    name: lesson.instructor,
    initials: getInitials(lesson.instructor),
    avatarUrl: "",
    location: lesson.location,
    pricePerHour: null,
  };
}

function DateBlock({
  month,
  day,
  weekday,
}: Readonly<Pick<Lesson, "month" | "day" | "weekday">>) {
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-white">
      <span className="text-[10px] font-semibold tracking-wide text-blue-600">
        {month}
      </span>

      <span className="text-xl font-bold leading-none text-slate-900">
        {day}
      </span>

      <span className="text-[10px] font-medium text-[#4b5563]">{weekday}</span>
    </div>
  );
}

export function LessonCard({ lesson }: LessonCardProps) {
  const router = useRouter();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isOpeningReview, setIsOpeningReview] = useState(false);

  const { submitReview } = useStudentReview();

  const badge = statusBadges[lesson.status];
  const isUpcoming = lesson.status === "upcoming";
  const isCompleted = lesson.status === "completed";
  const isReviewed = Boolean(lesson.review);

  const instructor = getInstructorOption(lesson);

  const lessonLabel = `${lesson.month} ${lesson.day} · ${lesson.weekday} · ${lesson.timeRange}`;

  let reviewButtonClassName: string = actionButtonStyles.completed;

  if (isReviewed) {
    reviewButtonClassName =
      "cursor-default border border-green-200 bg-green-50 text-green-700";
  } else if (isOpeningReview) {
    reviewButtonClassName = `${actionButtonStyles.completed} pointer-events-none`;
  }

  let reviewButtonContent: ReactNode = actionLabels.completed;

  if (isOpeningReview) {
    reviewButtonContent = <ButtonSpinner />;
  } else if (isReviewed) {
    reviewButtonContent = "Review submitted";
  }

  async function handleReviewSubmit(
    rating: number,
    comment: string,
  ): Promise<void> {
    await submitReview({
      bookingId: lesson.id,
      rating,
      comment,
    });
  }

  function handleReschedule() {
    if (isRescheduling) {
      return;
    }

    setIsRescheduling(true);

    window.setTimeout(() => {
      router.push(`/dashboard/reschedule/${lesson.id}`);
    }, BUTTON_LOADING_MS);
  }

  function handleCancel() {
    router.push(`/dashboard/cancel/${lesson.id}`);
  }

  function handleOpenReview() {
    if (isReviewed || isOpeningReview) {
      return;
    }

    setIsOpeningReview(true);

    window.setTimeout(() => {
      setShowReviewModal(true);
      setIsOpeningReview(false);
    }, BUTTON_LOADING_MS);
  }

  function handleCardClick() {
    if (!instructor.id) {
      return;
    }

    router.push(`/dashboard/instructor/${instructor.id}`);
  }

  return (
    <article className="relative rounded-2xl bg-[#f9f9f9] p-3 transition hover:bg-[#f0f0f0]">
      {instructor.id ? (
        <button
          type="button"
          aria-label={`View ${instructor.name}'s profile`}
          onClick={handleCardClick}
          className="absolute inset-0 z-0 cursor-pointer rounded-2xl"
        />
      ) : null}

      <div className="pointer-events-none relative z-10 flex gap-3">
        <DateBlock
          month={lesson.month}
          day={lesson.day}
          weekday={lesson.weekday}
        />

        <div
          className={`flex min-w-0 flex-1 flex-col justify-between gap-2 ${
            isUpcoming ? "pr-5" : ""
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">
                {lesson.timeRange}
              </p>

              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
              >
                {badge.label(lesson.hours)}
              </span>
            </div>

            <div className="mt-1.5">
              <InstructorProfileSummary instructor={instructor} compact />
            </div>
          </div>

          {isCompleted && (
            <button
              type="button"
              aria-busy={isOpeningReview}
              disabled={isReviewed}
              onClick={handleOpenReview}
              className={`pointer-events-auto inline-flex h-7 min-w-29 items-center justify-center self-end rounded-lg px-3 text-xs font-medium transition ${reviewButtonClassName}`}
            >
              {reviewButtonContent}
            </button>
          )}

          {isUpcoming && (
            <button
              type="button"
              aria-busy={isRescheduling}
              onClick={handleReschedule}
              className={`pointer-events-auto inline-flex h-7 min-w-26 items-center justify-center self-end rounded-lg px-3 text-xs font-medium transition ${
                isRescheduling
                  ? `${actionButtonStyles.upcoming} pointer-events-none`
                  : actionButtonStyles.upcoming
              }`}
            >
              {isRescheduling ? (
                <ButtonSpinner inverse />
              ) : (
                actionLabels.upcoming
              )}
            </button>
          )}
        </div>
      </div>

      {isUpcoming && (
        <button
          type="button"
          aria-label="Cancel booking"
          title="Cancel booking"
          onClick={handleCancel}
          className="absolute right-2 top-2 z-20 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <XCircleIcon className="h-4 w-4" />
        </button>
      )}

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
