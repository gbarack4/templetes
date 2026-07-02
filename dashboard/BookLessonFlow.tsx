"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import type { Lesson } from "./types";
import { markLessonBooked } from "./book-lesson";
import {
  buildLessonDurationOptions,
  calculateLessonPayment,
  formatCurrency,
  formatLessonHoursLabel,
  formatLessonTimeRange,
  mockInstructors,
  mockRescheduleDates,
  mockRescheduleTimeSlots,
} from "./mock-data";
import { FlowPageHeader } from "./components/FlowPageHeader";
import { LessonPayment } from "./components/LessonPayment";
import {
  getSelectedRescheduleDate,
  RescheduleCalendar,
} from "./components/RescheduleCalendar";
import {
  InstructorProfileSummary,
  InstructorSearch,
} from "./components/InstructorSearch";
import { CalendarIcon, ChevronRightIcon, CloseIcon } from "./components/icons";
import { mockDashboardData } from "./mock-data";
import { useStudentCreditHours } from "./useStudentCreditHours";

type BookLessonFlowProps = Readonly<{
  initialCreditHours?: number;
}>;

type FlowStep = "instructor" | "date" | "time" | "summary";

const BUTTON_LOADING_MS = 2000;

function scrollStepIntoView(element: HTMLElement | null) {
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function getStepRef(
  step: FlowStep,
  refs: {
    instructor: RefObject<HTMLElement | null>;
    date: RefObject<HTMLElement | null>;
    time: RefObject<HTMLElement | null>;
    summary: RefObject<HTMLElement | null>;
  },
) {
  if (step === "summary") return refs.summary;
  if (step === "time") return refs.time;
  if (step === "date") return refs.date;
  return refs.instructor;
}

export function BookLessonFlow({
  initialCreditHours = mockDashboardData.availableCreditHours,
}: BookLessonFlowProps) {
  const router = useRouter();
  const [availableCreditHours] = useStudentCreditHours(initialCreditHours);
  const [selectedHours, setSelectedHours] = useState<number>(1.5);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [showInstructorSearch, setShowInstructorSearch] = useState(true);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isContinuingToPayment, setIsContinuingToPayment] = useState(false);

  const instructorStepRef = useRef<HTMLElement>(null);
  const dateStepRef = useRef<HTMLElement>(null);
  const timeStepRef = useRef<HTMLElement>(null);
  const summaryStepRef = useRef<HTMLElement>(null);
  const skipInitialScroll = useRef(true);
  const previousFlowStep = useRef<FlowStep | null>(null);

  const selectedInstructor = mockInstructors.find(
    (instructor) => instructor.id === selectedInstructorId,
  );
  const selectedDate = getSelectedRescheduleDate(mockRescheduleDates, selectedDateId);
  const durationOptions = buildLessonDurationOptions(
    Math.max(availableCreditHours, 4),
  );
  const payment = calculateLessonPayment(selectedHours, availableCreditHours);
  const canConfirm =
    selectedInstructor &&
    selectedDate &&
    selectedTime &&
    !showInstructorSearch;

  const flowStep: FlowStep = canConfirm
    ? "summary"
    : selectedDate && selectedInstructor && !showInstructorSearch
      ? "time"
      : selectedInstructor && !showInstructorSearch
        ? "date"
        : "instructor";

  useEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      previousFlowStep.current = flowStep;
      return;
    }

    if (previousFlowStep.current === flowStep) return;
    previousFlowStep.current = flowStep;

    const stepRef = getStepRef(flowStep, {
      instructor: instructorStepRef,
      date: dateStepRef,
      time: timeStepRef,
      summary: summaryStepRef,
    });

    requestAnimationFrame(() => {
      scrollStepIntoView(stepRef.current);
    });
  }, [flowStep]);

  function handleInstructorSelect(instructorId: string) {
    setSelectedInstructorId(instructorId);
    setShowInstructorSearch(false);
    setSelectedDateId(null);
    setSelectedTime(null);
  }

  function handleHoursChange(hours: number) {
    setSelectedHours(hours);
    setSelectedTime(null);
    setShowDurationPicker(false);

    if (!selectedInstructorId) {
      requestAnimationFrame(() => scrollStepIntoView(instructorStepRef.current));
    }
  }

  function handleTimeChange(time: string) {
    setSelectedTime(time);
    setShowTimePicker(false);
  }

  function handleConfirm() {
    if (!canConfirm || !selectedInstructor || !selectedDate || !selectedTime) return;

    const lesson: Lesson = {
      id: `upcoming-${Date.now()}`,
      month: selectedDate.month,
      day: selectedDate.day,
      weekday: selectedDate.weekday,
      timeRange: formatLessonTimeRange(selectedTime, selectedHours),
      instructor: selectedInstructor.name,
      location: selectedInstructor.location,
      hours: selectedHours,
      status: "upcoming",
    };

    markLessonBooked(lesson);
    setShowPayment(false);
    setIsConfirmed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToDashboard() {
    router.push("/dashboard");
  }

  if (isConfirmed && selectedInstructor && selectedDate && selectedTime) {
    return (
      <main className="absolute inset-0 overflow-hidden bg-white px-5 pb-24 pt-6 text-center">
        <div className="flex flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="mt-6 text-xl font-bold text-slate-900">Lesson booked</h1>
          <p className="mt-2 text-sm text-slate-500">
            Payment complete. Your lesson has been added to upcoming lessons.
          </p>
          <div className="mt-6 w-full rounded-2xl bg-slate-50 p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {selectedHours} hour lesson
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatLessonTimeRange(selectedTime, selectedHours)}
            </p>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <InstructorProfileSummary instructor={selectedInstructor} />
            </div>
          </div>
          <button
            type="button"
            onClick={goToDashboard}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (
    showPayment &&
    canConfirm &&
    selectedInstructor &&
    selectedDate &&
    selectedTime
  ) {
    return (
      <>
        <FlowPageHeader title="Payment" onBack={() => setShowPayment(false)} />
        <LessonPayment
          instructor={selectedInstructor}
          dateLabel={`${selectedDate.month} ${selectedDate.day} · ${selectedDate.weekday}`}
          timeLabel={formatLessonTimeRange(selectedTime, selectedHours)}
          hours={selectedHours}
          payment={payment}
          onBack={() => setShowPayment(false)}
          onComplete={handleConfirm}
        />
      </>
    );
  }

  return (
    <>
      <header className="flex shrink-0 items-center px-5 pt-4">
        <button
          type="button"
          onClick={goToDashboard}
          aria-label="Close"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-50"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </header>
      <main className="flex-1 space-y-6 px-5 pb-24 pt-2">
        <section>
          <h1 className="text-xl font-bold text-slate-900">Book a lesson</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Choose your instructor, date, and time.
          </p>
        </section>

      <section className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
          <CalendarIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-600">Available credit</p>
          <p className="text-base font-bold text-slate-900">
            {availableCreditHours} Hours
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Lesson duration</h2>
        <button
          type="button"
          onClick={() => setShowDurationPicker((open) => !open)}
          className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
        >
          <span className="text-sm font-medium text-slate-900">
            {formatLessonHoursLabel(selectedHours)}
          </span>
          <ChevronRightIcon
            className={`h-4 w-4 shrink-0 text-slate-400 transition ${
              showDurationPicker ? "rotate-90" : ""
            }`}
          />
        </button>

        {showDurationPicker && (
          <div className="flex max-h-44 flex-col gap-2 overflow-y-auto overscroll-y-contain rounded-xl border border-slate-200 bg-white p-2">
            {durationOptions.map((hours) => {
              const isSelected = selectedHours === hours;

              return (
                <button
                  key={hours}
                  type="button"
                  onClick={() => handleHoursChange(hours)}
                  className={`w-full shrink-0 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {formatLessonHoursLabel(hours)}
                </button>
              );
            })}
          </div>
        )}

        {payment.payableHours > 0 && (
          <p className="text-sm text-slate-500">
            {formatCurrency(payment.totalDue)} due at checkout (
            {formatLessonHoursLabel(payment.payableHours)} not covered by credit).
          </p>
        )}
      </section>

      <>
          <section ref={instructorStepRef} className="space-y-3">
          {selectedInstructor && !showInstructorSearch && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Instructor
              </p>
              <div className="mt-3">
                <InstructorProfileSummary instructor={selectedInstructor} />
              </div>
              <button
                type="button"
                onClick={() => setShowInstructorSearch(true)}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Change instructor
              </button>
            </div>
          )}

          {showInstructorSearch && (
            <InstructorSearch
              title={selectedInstructor ? "Change instructor" : "Select instructor"}
              instructors={mockInstructors}
              onSelect={handleInstructorSelect}
              onCancel={
                selectedInstructor ? () => setShowInstructorSearch(false) : undefined
              }
            />
          )}
          </section>

          {selectedInstructor && !showInstructorSearch && !selectedDate && (
            <section ref={dateStepRef} className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Pick a date</h2>
              <RescheduleCalendar
                availableDates={mockRescheduleDates}
                selectedDateId={selectedDateId}
                onSelectDate={(dateId) => {
                  setSelectedDateId(dateId);
                  setSelectedTime(null);
                }}
              />
            </section>
          )}

          {selectedInstructor && selectedDate && !showInstructorSearch && (
            <section ref={timeStepRef} className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Selected date
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">{selectedDate.label}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDateId(null);
                  setSelectedTime(null);
                }}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Change date
              </button>
              </div>

              <h2 className="text-sm font-semibold text-slate-900">Pick a time</h2>
              <button
                type="button"
                onClick={() => setShowTimePicker((open) => !open)}
                className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
              >
                <span
                  className={`text-sm font-medium ${
                    selectedTime ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {selectedTime ?? "Select time"}
                </span>
                <ChevronRightIcon
                  className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                    showTimePicker ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showTimePicker && (
                <div className="flex max-h-44 flex-col gap-2 overflow-y-auto overscroll-y-contain rounded-xl border border-slate-200 bg-white p-2">
                  {mockRescheduleTimeSlots.map((time) => {
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimeChange(time)}
                        className={`w-full shrink-0 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {canConfirm && (
            <section ref={summaryStepRef} className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Booking summary
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatLessonTimeRange(selectedTime, selectedHours)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {selectedHours} {selectedHours === 1 ? "hour" : "hours"} ·{" "}
                {selectedInstructor.name}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Total: {formatCurrency(payment.totalDue)}
                {payment.creditHoursUsed > 0 &&
                  ` (${formatCurrency(payment.creditDiscount)} credit applied)`}
              </p>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <InstructorProfileSummary instructor={selectedInstructor} />
              </div>
            </div>

            <button
              type="button"
              aria-busy={isContinuingToPayment}
              onClick={() => {
                if (isContinuingToPayment) return;
                setIsContinuingToPayment(true);
                window.setTimeout(() => {
                  setShowPayment(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }, BUTTON_LOADING_MS);
              }}
              className={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 ${
                isContinuingToPayment ? "pointer-events-none" : ""
              }`}
            >
              {isContinuingToPayment ? (
                <ButtonSpinner inverse />
              ) : (
                "Continue to payment"
              )}
            </button>
            </section>
          )}
        </>
      </main>
    </>
  );
}
