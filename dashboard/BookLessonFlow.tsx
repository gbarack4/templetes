"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ButtonSpinner } from "@/components/ButtonSpinner";
import { useSchoolId } from "@/dashboard/SchoolContext";
import { createCreditBooking, CreditApiError } from "@/lib/credit-booking-api";
import { useBookingInstructors } from "@/shared/hooks/useBookingInstructors";
import { useCreditAvailability } from "@/shared/hooks/useCreditAvailability";
import { useStudentCreditBalance } from "@/shared/hooks/useStudentCreditBalance";
import type { CreateCreditBookingInput } from "@/types/credit-booking";
import { getCurrentMonth } from "@/shared/utils/get-current-month";
import type { InstructorOption } from "@/types/instructor";

import { CalendarPickerModal } from "./components/CalendarPickerModal";
import {
  InstructorProfileSummary,
  InstructorSearch,
} from "./components/InstructorSearch";
import { CalendarIcon, ChevronRightIcon, CloseIcon } from "./components/icons";
import { getSelectedRescheduleDate } from "./components/RescheduleCalendar";
import { TimePickerModal } from "./components/TimePickerModal";
import { formatLessonHoursLabel, formatLessonTimeRange } from "./mock-data";
import { useStudent } from "@/shared/hooks/useStudent";

type FlowStep = "instructor" | "date" | "time" | "summary";

const MAX_CREDIT_BOOKING_HOURS = 3;

function scrollStepIntoView(element: HTMLElement | null) {
  element?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
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

export function BookLessonFlow() {
  const router = useRouter();
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();
  const studentCreditBalanceQueryKey = [
    "student-credit-balance",
    schoolId,
    userId,
  ] as const;

  const [instructorSearchQuery, setInstructorSearchQuery] = useState("");

  const {
    instructors: bookingInstructors,
    loading: isInstructorsLoading,
    error: instructorsError,
    refetch: refetchInstructors,
  } = useBookingInstructors(instructorSearchQuery);

  const instructors: InstructorOption[] = bookingInstructors.map(
    (instructor) => {
      const pricePerHour =
        instructor.pricePerHour === null
          ? null
          : Number(instructor.pricePerHour);

      return {
        id: instructor.id,
        name: instructor.name,
        initials: "",
        avatarUrl: instructor.avatarUrl ?? "",
        location: [instructor.suburb, instructor.postcode]
          .filter(Boolean)
          .join(", "),
        pricePerHour:
          pricePerHour !== null && Number.isFinite(pricePerHour)
            ? pricePerHour
            : null,
      };
    },
  );

  const {
    balanceMinutes,
    loading: isBalanceLoading,
    error: balanceError,
    refetch: refetchCreditBalance,
  } = useStudentCreditBalance();

  const { student } = useStudent();

  const pickupSuburb = student?.addressSuburb?.trim() ?? "";
  const pickupPostcode = student?.addressPostcode?.trim() || undefined;

  const availableCreditHours = (balanceMinutes ?? 0) / 60;

  const [selectedHours, setSelectedHours] = useState(1);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(getCurrentMonth);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showInstructorSearch, setShowInstructorSearch] = useState(true);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [pendingAttempt, setPendingAttempt] =
    useState<CreateCreditBookingInput | null>(null);
  const [confirmedBalanceMinutes, setConfirmedBalanceMinutes] = useState<
    number | null
  >(null);

  const instructorStepRef = useRef<HTMLElement>(null);
  const dateStepRef = useRef<HTMLElement>(null);
  const timeStepRef = useRef<HTMLElement>(null);
  const summaryStepRef = useRef<HTMLElement>(null);

  const skipInitialScroll = useRef(true);
  const previousFlowStep = useRef<FlowStep | null>(null);
  const submissionLock = useRef(false);

  const [selectedInstructor, setSelectedInstructor] =
    useState<InstructorOption | null>(null);

  const maxDurationMinutes = Math.min(
    balanceMinutes ?? 0,
    MAX_CREDIT_BOOKING_HOURS * 60,
  );

  const durationOptions: number[] = [];

  for (let minutes = 60; minutes <= maxDurationMinutes; minutes += 15) {
    durationOptions.push(minutes / 60);
  }

  const selectedDurationMinutes = selectedHours * 60;

  const hasEnoughCredit =
    !isBalanceLoading &&
    !balanceError &&
    balanceMinutes !== null &&
    Number.isInteger(selectedDurationMinutes) &&
    selectedDurationMinutes >= 60 &&
    selectedDurationMinutes <= MAX_CREDIT_BOOKING_HOURS * 60 &&
    selectedDurationMinutes % 15 === 0 &&
    balanceMinutes >= selectedDurationMinutes;

  const remainingCreditHours = Math.max(
    0,
    availableCreditHours - selectedHours,
  );

  const availabilitySearch =
    selectedInstructor && hasEnoughCredit
      ? {
          instructorId: selectedInstructor.id,
          month: calendarMonth,
          durationMinutes: selectedDurationMinutes,
        }
      : null;

  const {
    availability,
    loading: isAvailabilityLoading,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useCreditAvailability(availabilitySearch);

  const availableDates = useMemo(
    () =>
      availability.map((day) => {
        const [year, month, date] = day.date.split("-").map(Number);
        const monthIndex = month - 1;
        const calendarDate = new Date(year, monthIndex, date);

        return {
          id: `date-${year}-${monthIndex}-${date}`,
          year,
          monthIndex,
          month: calendarDate
            .toLocaleDateString("en-US", { month: "short" })
            .toUpperCase(),
          day: date,
          weekday: calendarDate
            .toLocaleDateString("en-US", { weekday: "short" })
            .toUpperCase(),
          label: calendarDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            weekday: "long",
          }),
          slotCount: day.slotCount,
          availability: "open" as const,
        };
      }),
    [availability],
  );

  const selectedDate = getSelectedRescheduleDate(
    availableDates,
    selectedDateId,
  );

  const selectedDateIso = selectedDate
    ? `${selectedDate.year}-${String(selectedDate.monthIndex + 1).padStart(
        2,
        "0",
      )}-${String(selectedDate.day).padStart(2, "0")}`
    : null;

  const selectedAvailabilityDay = selectedDateIso
    ? (availability.find((day) => day.date === selectedDateIso) ?? null)
    : null;

  const availableTimeSlots =
    selectedAvailabilityDay?.slots.map((slot) => slot.startTime) ?? [];

  const selectedSlot =
    selectedAvailabilityDay?.slots.find(
      (slot) => slot.startTime === selectedTime,
    ) ?? null;

  const canBook = Boolean(
    selectedInstructor &&
    selectedDate &&
    selectedSlot &&
    !showInstructorSearch &&
    hasEnoughCredit,
  );

  const selectionLocked = isBooking || pendingAttempt !== null;
  const canSubmit = pendingAttempt !== null || canBook;

  const confirmedRemainingCreditHours =
    confirmedBalanceMinutes === null ? null : confirmedBalanceMinutes / 60;

  const bookingButtonLabel = pendingAttempt
    ? "Retry confirmation"
    : "Book with credit";

  let flowStep: FlowStep = "instructor";

  if (selectedInstructor && !showInstructorSearch) {
    flowStep = "date";

    if (selectedDate) {
      flowStep = selectedSlot ? "summary" : "time";
    }
  }

  useEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      previousFlowStep.current = flowStep;
      return;
    }

    if (previousFlowStep.current === flowStep) {
      return;
    }

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
    if (selectionLocked) {
      return;
    }

    const instructor = instructors.find((item) => item.id === instructorId);

    if (!instructor) {
      return;
    }

    setSelectedInstructor(instructor);
    setInstructorSearchQuery("");
    setShowInstructorSearch(false);
    setCalendarMonth(getCurrentMonth());
    setSelectedDateId(null);
    setSelectedTime(null);
    setShowDatePicker(true);
    setBookingError("");
  }

  function handleHoursChange(hours: number) {
    if (selectionLocked || !durationOptions.includes(hours)) {
      return;
    }

    setSelectedHours(hours);
    setSelectedDateId(null);
    setSelectedTime(null);
    setShowDurationPicker(false);
    setBookingError("");

    if (selectedInstructor) {
      setCalendarMonth(getCurrentMonth());
      setShowDatePicker(true);
      return;
    }

    requestAnimationFrame(() => {
      scrollStepIntoView(instructorStepRef.current);
    });
  }

  function handleTimeChange(time: string) {
    if (selectionLocked) {
      return;
    }

    setSelectedTime(time);
    setShowTimePicker(false);
    setBookingError("");
  }

  async function handleConfirm() {
    if (submissionLock.current || isConfirmed) {
      return;
    }

    let input: CreateCreditBookingInput | null = pendingAttempt;

    if (!input) {
      if (!canBook || !selectedInstructor || !selectedSlot || !pickupSuburb) {
        if (!pickupSuburb) {
          setBookingError(
            "Your pickup suburb is unavailable. Please update your address.",
          );
        }

        return;
      }

      if (Date.parse(selectedSlot.startDatetime) <= Date.now()) {
        setSelectedTime(null);
        setBookingError(
          "This time has already passed. Please choose another slot.",
        );
        void refetchAvailability();
        return;
      }

      input = {
        instructorId: selectedInstructor.id,
        startDatetime: selectedSlot.startDatetime,
        durationMinutes: selectedDurationMinutes,
        pickupSuburb,
        pickupPostcode,
        idempotencyKey: crypto.randomUUID(),
      };
    }

    submissionLock.current = true;
    setIsBooking(true);
    setBookingError("");
    setPendingAttempt(input);

    try {
      const token = await getToken();

      if (!token) {
        throw new CreditApiError(
          "Your session expired. Please sign in again.",
          401,
        );
      }

      await queryClient.cancelQueries({
        queryKey: studentCreditBalanceQueryKey,
      });

      const result = await createCreditBooking(schoolId, token, input);

      setConfirmedBalanceMinutes(result.balanceMinutes);
      setIsConfirmed(true);
      setPendingAttempt(null);

      await queryClient.cancelQueries({
        queryKey: studentCreditBalanceQueryKey,
      });

      queryClient.setQueryData(studentCreditBalanceQueryKey, {
        balanceMinutes: result.balanceMinutes,
      });

      void queryClient.invalidateQueries({
        queryKey: ["credit-availability", schoolId, userId],
        refetchType: "none",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to book the lesson.";

      const rejected =
        error instanceof CreditApiError &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 408 &&
        error.status !== 429;

      if (rejected) {
        setPendingAttempt(null);
        setSelectedTime(null);
        setBookingError(message);
        void refetchCreditBalance();
        void refetchAvailability();
      } else {
        setBookingError(
          `${message} The booking status is not yet known. Retry confirmation to check the same booking.`,
        );
      }
    } finally {
      submissionLock.current = false;
      setIsBooking(false);
    }
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

          <h1 className="mt-6 text-xl font-bold text-slate-900">
            Lesson booked
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your lesson has been booked using your available credit.
          </p>

          <div className="mt-6 w-full rounded-2xl bg-[#f9f9f9] p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {formatLessonHoursLabel(selectedHours)}
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

            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Credit used</span>

                <span className="font-medium text-slate-900">
                  {formatLessonHoursLabel(selectedHours)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Remaining credit</span>

                <span className="font-medium text-slate-900">
                  {confirmedRemainingCreditHours === null
                    ? "Unavailable"
                    : formatLessonHoursLabel(confirmedRemainingCreditHours)}
                </span>
              </div>
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

  return (
    <>
      <header className="flex shrink-0 items-center px-5 pt-4">
        <button
          type="button"
          onClick={goToDashboard}
          aria-label="Close"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-[#f9f9f9]"
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

        <section className="flex items-center gap-3 rounded-2xl bg-[#f9f9f9] px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
            <CalendarIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-600">You have</p>
            <p className="text-base font-bold text-slate-900">
              {isBalanceLoading
                ? "Loading..."
                : balanceMinutes === null
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

        {balanceError && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            <p>{balanceError}</p>

            <button
              type="button"
              onClick={() => void refetchCreditBalance()}
              className="mt-2 font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Lesson duration
          </h2>

          <button
            type="button"
            disabled={durationOptions.length === 0 || selectionLocked}
            onClick={() => {
              if (durationOptions.length === 0) {
                return;
              }

              setShowDurationPicker((open) => !open);
            }}
            className="flex w-full items-center justify-between rounded-xl bg-[#f9f9f9] px-4 py-3 text-left transition hover:bg-[#f0f0f0] disabled:cursor-not-allowed disabled:opacity-50"
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

          {balanceMinutes !== null && durationOptions.length === 0 && (
            <p className="text-sm text-red-500">
              You do not have enough credit to book a lesson.
            </p>
          )}

          {durationOptions.length > 0 && (
            <p className="text-xs text-slate-500">
              Credit bookings can be up to {MAX_CREDIT_BOOKING_HOURS} hours.
            </p>
          )}

          {showDurationPicker && durationOptions.length > 0 && (
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
                        : "text-slate-700 hover:bg-[#f9f9f9]"
                    }`}
                  >
                    {formatLessonHoursLabel(hours)}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section ref={instructorStepRef} className="space-y-3">
          {selectedInstructor && !showInstructorSearch && (
            <div className="rounded-2xl bg-[#f9f9f9] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Instructor
              </p>

              <div className="mt-3">
                <InstructorProfileSummary instructor={selectedInstructor} />
              </div>

              <button
                type="button"
                disabled={selectionLocked}
                onClick={() => {
                  if (selectionLocked) {
                    return;
                  }

                  setInstructorSearchQuery("");
                  setShowInstructorSearch(true);
                }}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Change instructor
              </button>
            </div>
          )}

          {(showInstructorSearch || !selectedInstructor) && (
            <>
              {instructorsError && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
                >
                  <p>{instructorsError}</p>

                  <button
                    type="button"
                    onClick={() => void refetchInstructors()}
                    className="mt-2 font-medium underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!instructorsError && (
                <InstructorSearch
                  title={
                    selectedInstructor
                      ? "Change instructor"
                      : "Select instructor"
                  }
                  instructors={instructors}
                  query={instructorSearchQuery}
                  loading={isInstructorsLoading}
                  onQueryChange={setInstructorSearchQuery}
                  onSelect={handleInstructorSelect}
                  onCancel={
                    selectedInstructor
                      ? () => {
                          setInstructorSearchQuery("");
                          setShowInstructorSearch(false);
                        }
                      : undefined
                  }
                />
              )}
            </>
          )}
        </section>

        {selectedInstructor && !showInstructorSearch && showDatePicker && (
          <CalendarPickerModal
            title={selectedDate ? "Change date" : "Pick a date"}
            month={calendarMonth}
            availableDates={availableDates}
            selectedDateId={selectedDateId}
            loading={isAvailabilityLoading}
            error={availabilityError}
            onRetry={() => void refetchAvailability()}
            onMonthChange={(month) => {
              if (selectionLocked) {
                return;
              }

              setCalendarMonth(month);
              setSelectedDateId(null);
              setSelectedTime(null);
              setBookingError("");
            }}
            onSelectDate={(dateId) => {
              if (selectionLocked) {
                return;
              }

              setSelectedDateId(dateId);
              setShowDatePicker(false);
              setSelectedTime(null);
              setShowTimePicker(true);
              setBookingError("");
            }}
            onClose={() => setShowDatePicker(false)}
          />
        )}

        {selectedInstructor &&
          !showInstructorSearch &&
          !selectedDate &&
          !showDatePicker && (
            <section ref={dateStepRef} className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Pick a date
              </h2>

              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="flex w-full items-center justify-between rounded-xl bg-[#f9f9f9] px-4 py-3 text-left transition hover:bg-[#f0f0f0]"
              >
                <span className="text-sm font-medium text-slate-400">
                  Select date
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            </section>
          )}

        {selectedInstructor &&
          selectedDate &&
          !showInstructorSearch &&
          !showDatePicker && (
            <section ref={timeStepRef} className="space-y-3">
              <div className="rounded-2xl bg-[#f9f9f9] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Selected date
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {selectedDate.month} {selectedDate.day} ·{" "}
                  {selectedDate.weekday}
                </p>

                <p className="mt-0.5 text-sm text-slate-500">
                  {selectedDate.label}
                </p>

                <button
                  type="button"
                  disabled={selectionLocked}
                  onClick={() => {
                    if (!selectionLocked) {
                      setShowDatePicker(true);
                    }
                  }}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Change date
                </button>
              </div>

              <h2 className="text-sm font-semibold text-slate-900">
                Pick a time
              </h2>

              <button
                type="button"
                disabled={selectionLocked || availableTimeSlots.length === 0}
                onClick={() => {
                  if (!selectionLocked && availableTimeSlots.length > 0) {
                    setShowTimePicker(true);
                  }
                }}
                className="flex w-full items-center justify-between rounded-xl bg-[#f9f9f9] px-4 py-3 text-left transition hover:bg-[#f0f0f0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className={`text-sm font-medium ${
                    selectedTime ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {selectedTime ?? "Select time"}
                </span>

                <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
              </button>

              {showTimePicker && (
                <TimePickerModal
                  timeSlots={availableTimeSlots}
                  selectedTime={selectedTime}
                  onSelectTime={handleTimeChange}
                  onClose={() => setShowTimePicker(false)}
                />
              )}
            </section>
          )}

        {selectedInstructor &&
          selectedDate &&
          selectedTime &&
          !showInstructorSearch && (
            <section ref={summaryStepRef} className="space-y-3">
              <div className="rounded-2xl bg-[#f9f9f9] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Booking summary
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {selectedDate.month} {selectedDate.day} ·{" "}
                  {selectedDate.weekday}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {formatLessonTimeRange(selectedTime, selectedHours)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatLessonHoursLabel(selectedHours)} ·{" "}
                  {selectedInstructor.name}
                </p>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <InstructorProfileSummary instructor={selectedInstructor} />
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Available credit</span>

                    <span className="font-medium text-slate-900">
                      {isBalanceLoading
                        ? "Loading..."
                        : balanceMinutes === null
                          ? "Unavailable"
                          : `${Number(availableCreditHours.toFixed(2))} Hours`}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Credit used</span>

                    <span className="font-medium text-slate-900">
                      {formatLessonHoursLabel(selectedHours)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Remaining credit</span>

                    <span className="font-semibold text-slate-900">
                      {balanceMinutes === null
                        ? "Unavailable"
                        : formatLessonHoursLabel(remainingCreditHours)}
                    </span>
                  </div>
                </div>
              </div>

              {bookingError && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {bookingError}
                </div>
              )}

              <button
                type="button"
                aria-busy={isBooking}
                disabled={!canSubmit || isBooking}
                onClick={() => void handleConfirm()}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isBooking ? <ButtonSpinner inverse /> : bookingButtonLabel}
              </button>

              {!hasEnoughCredit && (
                <p className="text-center text-sm text-red-500">
                  You do not have enough credit for this lesson.
                </p>
              )}
            </section>
          )}
      </main>
    </>
  );
}
