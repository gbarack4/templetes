"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import {
  buildLessonDurationOptions,
  formatCurrency,
  formatLessonHoursLabel,
  formatLessonTimeRange,
  mockRescheduleDates,
  mockRescheduleTimeSlots,
} from "@/dashboard/mock-data";
import { FlowPageHeader } from "@/dashboard/components/FlowPageHeader";
import { LessonPayment } from "@/dashboard/components/LessonPayment";
import {
  getSelectedRescheduleDate,
  RescheduleCalendar,
} from "@/dashboard/components/RescheduleCalendar";
import { InstructorProfileSummary } from "@/dashboard/components/InstructorSearch";
import { ChevronRightIcon, CloseIcon } from "@/dashboard/components/icons";
import { mockDashboardData } from "@/dashboard/mock-data";
import { useStudentCreditHours } from "@/dashboard/useStudentCreditHours";
import { calculateOnboardingLessonPayment } from "./book-lesson-payment";
import { BookingSignUp } from "./BookingSignUp";
import type { SuggestedInstructor } from "./suggested-instructors";

type BookInstructorFlowProps = Readonly<{
  instructor: SuggestedInstructor;
  returnPath?: string;
}>;

type FlowStep = "duration" | "date" | "time" | "address" | "summary";

const BUTTON_LOADING_MS = 2000;

function scrollStepIntoView(element: HTMLElement | null) {
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function getStepRef(
  step: FlowStep,
  refs: {
    duration: RefObject<HTMLElement | null>;
    date: RefObject<HTMLElement | null>;
    time: RefObject<HTMLElement | null>;
    address: RefObject<HTMLElement | null>;
    summary: RefObject<HTMLElement | null>;
  },
) {
  if (step === "summary") return refs.summary;
  if (step === "address") return refs.address;
  if (step === "time") return refs.time;
  if (step === "date") return refs.date;
  return refs.duration;
}

export function BookInstructorFlow({
  instructor,
  returnPath = "/preview/onboarding",
}: BookInstructorFlowProps) {
  const router = useRouter();
  const [availableCreditHours] = useStudentCreditHours(mockDashboardData.availableCreditHours);
  const [selectedHours, setSelectedHours] = useState<number>(1.5);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isContinuingToPayment, setIsContinuingToPayment] = useState(false);

  const durationStepRef = useRef<HTMLElement>(null);
  const dateStepRef = useRef<HTMLElement>(null);
  const timeStepRef = useRef<HTMLElement>(null);
  const addressStepRef = useRef<HTMLElement>(null);
  const summaryStepRef = useRef<HTMLElement>(null);
  const skipInitialScroll = useRef(true);
  const previousFlowStep = useRef<FlowStep | null>(null);

  const selectedDate = getSelectedRescheduleDate(mockRescheduleDates, selectedDateId);
  const trimmedPickupAddress = pickupAddress.trim();
  const durationOptions = buildLessonDurationOptions(Math.max(availableCreditHours, 4));
  const payment = calculateOnboardingLessonPayment(
    selectedHours,
    availableCreditHours,
    instructor.pricePerHour,
  );
  const canConfirm = Boolean(selectedDate && selectedTime && trimmedPickupAddress);

  const flowStep: FlowStep = showSummary && canConfirm && hasRegistered
    ? "summary"
    : selectedTime
      ? "address"
      : selectedDate
        ? "time"
        : "duration";

  useEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      previousFlowStep.current = flowStep;
      return;
    }

    if (previousFlowStep.current === flowStep) return;
    previousFlowStep.current = flowStep;

    const stepRef = getStepRef(flowStep, {
      duration: durationStepRef,
      date: dateStepRef,
      time: timeStepRef,
      address: addressStepRef,
      summary: summaryStepRef,
    });

    requestAnimationFrame(() => {
      scrollStepIntoView(stepRef.current);
    });
  }, [flowStep]);

  function handleHoursChange(hours: number) {
    setSelectedHours(hours);
    setSelectedTime(null);
    setPickupAddress("");
    setShowSignUp(false);
    setShowSummary(false);
    setHasRegistered(false);
    setShowDurationPicker(false);
  }

  function handleTimeChange(time: string) {
    setSelectedTime(time);
    setPickupAddress("");
    setShowSignUp(false);
    setShowSummary(false);
    setHasRegistered(false);
    setShowTimePicker(false);
  }

  function handleConfirm() {
    if (!canConfirm || !selectedDate || !selectedTime || !trimmedPickupAddress) return;
    setShowPayment(false);
    setIsConfirmed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const paymentForLesson = {
    ...payment,
    subtotal: payment.subtotal,
    creditDiscount: payment.creditDiscount,
    totalDue: payment.totalDue,
  };

  if (isConfirmed && selectedDate && selectedTime && trimmedPickupAddress) {
    return (
      <main className="flex flex-1 flex-col px-5 pb-24 pt-6 text-center">
        <div className="flex flex-1 flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="mt-6 text-xl font-bold text-slate-900">Lesson booked</h1>
          <p className="mt-2 text-sm text-slate-500">
            Payment complete. Your lesson with {instructor.name} is confirmed.
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
            <p className="mt-1 text-sm text-slate-500">
              Pick up: {trimmedPickupAddress}
            </p>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <InstructorProfileSummary instructor={instructor} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Log in
          </button>
        </div>
      </main>
    );
  }

  if (showSignUp && canConfirm && selectedDate && selectedTime && trimmedPickupAddress) {
    return (
      <BookingSignUp
        onBack={() => setShowSignUp(false)}
        onComplete={() => {
          setHasRegistered(true);
          setShowSignUp(false);
          setShowSummary(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  if (showPayment && canConfirm && hasRegistered && selectedDate && selectedTime && trimmedPickupAddress) {
    return (
      <>
        <FlowPageHeader title="Payment" onBack={() => setShowPayment(false)} />
        <LessonPayment
          instructor={instructor}
          dateLabel={`${selectedDate.month} ${selectedDate.day} · ${selectedDate.weekday}`}
          timeLabel={formatLessonTimeRange(selectedTime, selectedHours)}
          hours={selectedHours}
          payment={paymentForLesson}
          hourRate={instructor.pricePerHour}
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
          onClick={() => router.back()}
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
            Choose a date and time with {instructor.name}.
          </p>
        </section>

        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Instructor
          </p>
          <div className="mt-3">
            <InstructorProfileSummary instructor={instructor} />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900">
            {formatCurrency(instructor.pricePerHour)}/hr
          </p>
        </section>

        <section ref={durationStepRef} className="space-y-3">
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

        {!selectedDate && (
          <section ref={dateStepRef} className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Pick a date</h2>
            <RescheduleCalendar
              availableDates={mockRescheduleDates}
              selectedDateId={selectedDateId}
              onSelectDate={(dateId) => {
                setSelectedDateId(dateId);
                setSelectedTime(null);
                setPickupAddress("");
                setShowSignUp(false);
                setShowSummary(false);
                setHasRegistered(false);
              }}
            />
          </section>
        )}

        {selectedDate && (
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
                  setPickupAddress("");
                  setShowSignUp(false);
                  setShowSummary(false);
                  setHasRegistered(false);
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

        {selectedTime && (
          <section ref={addressStepRef} className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Selected time
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {formatLessonTimeRange(selectedTime, selectedHours)}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedTime(null);
                  setPickupAddress("");
                  setShowSignUp(false);
                  setShowSummary(false);
                  setHasRegistered(false);
                }}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Change time
              </button>
            </div>

            <h2 className="text-sm font-semibold text-slate-900">Pick up address</h2>
            <input
              type="text"
              value={pickupAddress}
              onChange={(event) => {
                setPickupAddress(event.target.value);
                setShowSignUp(false);
                setShowSummary(false);
                setHasRegistered(false);
              }}
              placeholder="Enter pick up address"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {trimmedPickupAddress && !showSignUp && !showSummary && (
              <button
                type="button"
                aria-busy={isContinuing}
                onClick={() => {
                  if (isContinuing) return;
                  setIsContinuing(true);
                  window.setTimeout(() => {
                    setShowSignUp(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, BUTTON_LOADING_MS);
                }}
                className={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 ${
                  isContinuing ? "pointer-events-none" : ""
                }`}
              >
                {isContinuing ? <ButtonSpinner inverse /> : "Continue"}
              </button>
            )}
          </section>
        )}

        {showSummary && hasRegistered && canConfirm && selectedDate && selectedTime && trimmedPickupAddress && (
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
                {selectedHours} {selectedHours === 1 ? "hour" : "hours"} · {instructor.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Pick up: {trimmedPickupAddress}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Total: {formatCurrency(payment.totalDue)}
                {payment.creditHoursUsed > 0 &&
                  ` (${formatCurrency(payment.creditDiscount)} credit applied)`}
              </p>
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
      </main>
    </>
  );
}
