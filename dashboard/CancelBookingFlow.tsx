"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lesson } from "./types";
import { markLessonCancelled } from "./cancel-booking";
import { FlowPageContent } from "./components/FlowPageContent";
import { FlowPageHeader } from "./components/FlowPageHeader";
import { MapPinIcon, UserIcon } from "./components/icons";

type CancelBookingFlowProps = Readonly<{
  lesson: Lesson;
}>;

function LessonSummary({ lesson }: Readonly<{ lesson: Lesson }>) {
  return (
    <section className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Booking details
      </p>
      <p className="mt-2 font-semibold text-slate-900">
        {lesson.month} {lesson.day} · {lesson.weekday}
      </p>
      <p className="mt-1 text-sm text-slate-600">{lesson.timeRange}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <UserIcon className="h-3.5 w-3.5 shrink-0" />
        {lesson.instructor}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
        <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
        {lesson.location}
      </p>
      <p className="mt-3 text-sm text-slate-600">{lesson.hours} hours lesson</p>
    </section>
  );
}

export function CancelBookingFlow({ lesson }: CancelBookingFlowProps) {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);

  function goBack() {
    router.push("/dashboard");
  }

  function handleConfirmCancel() {
    markLessonCancelled(lesson.id);
    setIsConfirmed(true);
  }

  if (isConfirmed) {
    return (
      <FlowPageContent className="text-center">
        <div className="flex flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
            ✕
          </div>
          <h1 className="mt-6 text-xl font-bold text-slate-900">Booking cancelled</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your lesson has been cancelled. Any credit will be returned to your
            account.
          </p>
          <div className="mt-6 w-full rounded-2xl bg-slate-50 p-4 text-left">
            <p className="font-semibold text-slate-900">
              {lesson.month} {lesson.day} · {lesson.weekday}
            </p>
            <p className="mt-1 text-sm text-slate-600">{lesson.timeRange}</p>
            <p className="mt-2 text-sm text-slate-500">{lesson.instructor}</p>
          </div>
          <button
            type="button"
            onClick={goBack}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </FlowPageContent>
    );
  }

  return (
    <>
      <FlowPageHeader title="Cancel booking" onBack={goBack} />
      <FlowPageContent>
        <p className="text-sm text-slate-500">
          Are you sure you want to cancel this lesson? This action cannot be
          undone.
        </p>

        <LessonSummary lesson={lesson} />

        <section className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-600">Cancellation policy</p>
          <p className="mt-1 text-sm text-red-500">
            Cancelling within 24 hours may affect your available credit. Your
            instructor will be notified automatically.
          </p>
        </section>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirmCancel}
            className="w-full rounded-lg bg-red-500 py-3 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Cancel booking
          </button>
          <button
            type="button"
            onClick={goBack}
            className="w-full rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Keep booking
          </button>
        </div>
      </FlowPageContent>
    </>
  );
}
