"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ButtonSpinner } from "@/components/ButtonSpinner";
import { useStudentBookings } from "@/shared/hooks/useStudentBookings";
import {
  type RescheduleSlot,
  useStudentRescheduleBooking,
  useStudentRescheduleSlots,
} from "@/shared/hooks/useStudentReschedule";
import { getCurrentMonth } from "@/shared/utils/get-current-month";

import { FlowPageContent } from "./components/FlowPageContent";
import { FlowPageHeader } from "./components/FlowPageHeader";
import { InstructorProfileSummary } from "./components/InstructorSearch";
import {
  getSelectedRescheduleDate,
  RescheduleCalendar,
} from "./components/RescheduleCalendar";

import type { RescheduleDateOption } from "./mock-data";
import type { Lesson } from "./types";

type RescheduleFlowProps = Readonly<{
  lessonId: string;
}>;

const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const WEEKDAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function buildFutureDates(monthsAhead = 12): RescheduleDateOption[] {
  const dates: RescheduleDateOption[] = [];

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + monthsAhead);

  const cursor = new Date(start);

  while (cursor < end) {
    const year = cursor.getFullYear();
    const monthIndex = cursor.getMonth();
    const day = cursor.getDate();

    dates.push({
      id: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`,
      year,
      monthIndex,
      month: MONTH_ABBR[monthIndex],
      day,
      weekday: WEEKDAY_ABBR[cursor.getDay()],
      label: cursor.toLocaleDateString("en-AU", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
      slotCount: 1,
      availability: "open",
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function getInstructorOption(lesson: Lesson) {
  if (typeof lesson.instructor === "string") {
    return {
      id: "",
      name: lesson.instructor,
      initials: lesson.instructor
        .split(/\s+/)
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      avatarUrl: "",
      location: lesson.location,
      pricePerHour: null,
    };
  }

  return {
    id: lesson.instructor.id,
    name: lesson.instructor.name,
    initials: lesson.instructor.name
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    avatarUrl: lesson.instructor.avatarUrl ?? "",
    location: lesson.location,
    pricePerHour: lesson.instructor.pricePerHour,
  };
}

function CurrentLessonCard({
  lesson,
}: Readonly<{
  lesson: Lesson;
}>) {
  const instructor = getInstructorOption(lesson);

  return (
    <section className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Current lesson
      </p>

      <p className="mt-2 font-semibold text-slate-900">
        {lesson.month} {lesson.day} · {lesson.weekday}
      </p>

      <p className="mt-1 text-sm text-slate-600">{lesson.timeRange}</p>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          Instructor
        </p>

        <InstructorProfileSummary instructor={instructor} />
      </div>
    </section>
  );
}

function getDateValue(date: RescheduleDateOption): string {
  return `${date.year}-${String(date.monthIndex + 1).padStart(
    2,
    "0",
  )}-${String(date.day).padStart(2, "0")}`;
}

export function RescheduleFlow({ lessonId }: RescheduleFlowProps) {
  const router = useRouter();

  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useStudentBookings({
    status: "upcoming",
  });

  const lesson = bookings.find((booking) => booking.id === lessonId);

  const availableDates = useMemo(() => buildFutureDates(), []);

  const [calendarMonth, setCalendarMonth] = useState(getCurrentMonth);

  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<RescheduleSlot | null>(null);

  const [isConfirmed, setIsConfirmed] = useState(false);

  const selectedDate = getSelectedRescheduleDate(
    availableDates,
    selectedDateId,
  );

  const selectedDateValue = selectedDate ? getDateValue(selectedDate) : null;

  const {
    slots,
    loading: slotsLoading,
    error: slotsError,
  } = useStudentRescheduleSlots(lessonId, selectedDateValue);

  const {
    rescheduleBooking,
    isRescheduling,
    error: rescheduleError,
  } = useStudentRescheduleBooking();

  function goBack() {
    router.push("/dashboard");
  }

  async function handleConfirm() {
    if (!selectedSlot || isRescheduling) {
      return;
    }

    try {
      await rescheduleBooking({
        bookingId: lessonId,
        startDatetime: selectedSlot.startDatetime,
      });

      setIsConfirmed(true);
    } catch {
      // Mutation error is displayed below.
    }
  }

  function renderSlots() {
    if (slotsLoading) {
      return (
        <div className="flex justify-center py-6">
          <ButtonSpinner />
        </div>
      );
    }

    if (slotsError) {
      return (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
        >
          {slotsError}
        </div>
      );
    }

    if (slots.length === 0) {
      return (
        <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
          No available times for this date.
        </div>
      );
    }

    return (
      <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.startDatetime === slot.startDatetime;

          return (
            <button
              key={slot.startDatetime}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {slot.startTime}
            </button>
          );
        })}
      </div>
    );
  }

  if (bookingsLoading) {
    return (
      <>
        <FlowPageHeader title="Reschedule lesson" onBack={goBack} />

        <FlowPageContent>
          <div className="flex justify-center py-12">
            <ButtonSpinner />
          </div>
        </FlowPageContent>
      </>
    );
  }

  if (bookingsError || !lesson) {
    return (
      <>
        <FlowPageHeader title="Reschedule lesson" onBack={goBack} />

        <FlowPageContent>
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-600"
          >
            {bookingsError ??
              "Booking not found or it can no longer be rescheduled."}
          </div>

          <button
            type="button"
            onClick={goBack}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white"
          >
            Back to Dashboard
          </button>
        </FlowPageContent>
      </>
    );
  }

  const instructor = getInstructorOption(lesson);

  if (isConfirmed && selectedDate && selectedSlot) {
    return (
      <FlowPageContent className="text-center">
        <div className="flex flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
            ✓
          </div>

          <h1 className="mt-6 text-xl font-bold text-slate-900">
            Lesson rescheduled
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your lesson has been updated with the details below.
          </p>

          <div className="mt-6 w-full rounded-2xl bg-slate-50 p-4 text-left">
            <p className="font-semibold text-slate-900">
              {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {selectedSlot.startTime} – {selectedSlot.endTime}
            </p>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <InstructorProfileSummary instructor={instructor} />
            </div>
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
      <FlowPageHeader title="Reschedule lesson" onBack={goBack} />

      <FlowPageContent>
        <CurrentLessonCard lesson={lesson} />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Pick a new date
          </h2>

          <RescheduleCalendar
            month={calendarMonth}
            availableDates={availableDates}
            selectedDateId={selectedDateId}
            showSlotLabels={false}
            onMonthChange={(month) => {
              setCalendarMonth(month);
              setSelectedDateId(null);
              setSelectedSlot(null);
            }}
            onSelectDate={(dateId) => {
              setSelectedDateId(dateId);
              setSelectedSlot(null);
            }}
          />
        </section>

        {selectedDate && (
          <section className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Selected date
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
            </p>

            <p className="mt-0.5 text-sm text-slate-500">
              {selectedDate.label}
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedDateId(null);
                setSelectedSlot(null);
              }}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Change date
            </button>
          </section>
        )}

        {selectedDate && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Pick a time
            </h2>

            {renderSlots()}
          </section>
        )}

        {selectedDate && selectedSlot && (
          <section className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              New lesson summary
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {selectedSlot.startTime} – {selectedSlot.endTime}
            </p>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <InstructorProfileSummary instructor={instructor} />
            </div>
          </section>
        )}

        {rescheduleError && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            {rescheduleError}
          </div>
        )}

        {selectedSlot && (
          <button
            type="button"
            aria-busy={isRescheduling}
            disabled={isRescheduling}
            onClick={() => void handleConfirm()}
            className={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 ${
              isRescheduling ? "pointer-events-none opacity-80" : ""
            }`}
          >
            {isRescheduling ? <ButtonSpinner inverse /> : "Confirm reschedule"}
          </button>
        )}
      </FlowPageContent>
    </>
  );
}
