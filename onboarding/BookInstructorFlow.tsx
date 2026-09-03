"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { ButtonSpinner } from "@/components/ButtonSpinner";
import {
  GoogleAddressAutocomplete,
  type AddressSelectionDetails,
} from "@/components/GoogleAddressAutocomplete";
import { CalendarPickerModal } from "@/dashboard/components/CalendarPickerModal";
import { FlowPageHeader } from "@/dashboard/components/FlowPageHeader";
import { CheckIcon, ChevronRightIcon } from "@/dashboard/components/icons";
import { InstructorProfileSummary } from "@/dashboard/components/InstructorSearch";
import { LessonPayment } from "@/dashboard/components/LessonPayment";
import { getSelectedRescheduleDate } from "@/dashboard/components/RescheduleCalendar";
import { TimePickerModal } from "@/dashboard/components/TimePickerModal";
import {
  buildFutureDates,
  formatCurrency,
  formatLessonHoursLabel,
  formatLessonTimeRange,
  formatShortLessonHours,
  mergeRescheduleDates,
  resolveRescheduleDateFromIso,
} from "@/onboarding/booking-utils";
import {
  fetchAvailableSlots,
  fetchPublicPackages,
} from "@/lib/public-booking-api";
import {
  createBooking,
  createPackagePayment,
  getPackagePaymentStatus,
  syncStudent,
} from "@/lib/booking-payment-api";
import {
  clearFirstBookingDraft,
  getFirstBookingDraft,
  saveFirstBookingDraft,
} from "./first-booking-draft";

import { calculateOnboardingLessonPayment } from "./book-lesson-payment";
import { BookingSignUp } from "./BookingSignUp";
import type { PublicInstructor } from "./suggested-instructors";
import { getCurrentMonth } from "@/shared/utils/get-current-month";

type BookInstructorFlowProps = Readonly<{
  instructor: PublicInstructor;
  initialSuburb?: string | null;
  initialDate?: string | null;
  initialTime?: string | null;
  initialDuration?: string | null;
}>;

type PublicPackage = Readonly<{
  id: string;
  name: string;
  durationMinutes: number;
  price: string;
}>;

type PublicAvailableSlot = Readonly<{
  instructorId: string;
  instructor: {
    name: string;
    avatarUrl: string | null;
    pricePerHour: string | null;
  };
  startDatetime: string;
  endDatetime: string;
  startTime: string;
  endTime: string;
}>;

type FlowStep = "address" | "duration" | "date" | "time" | "summary";

const BUTTON_LOADING_MS = 2000;

function scrollStepIntoView(element: HTMLElement | null) {
  element?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function getStepRef(
  step: FlowStep,
  refs: {
    address: RefObject<HTMLElement | null>;
    duration: RefObject<HTMLElement | null>;
    date: RefObject<HTMLElement | null>;
    time: RefObject<HTMLElement | null>;
    summary: RefObject<HTMLElement | null>;
  },
) {
  if (step === "summary") return refs.summary;
  if (step === "time") return refs.time;
  if (step === "date") return refs.date;
  if (step === "duration") return refs.duration;

  return refs.address;
}

export function BookInstructorFlow({
  instructor,
  initialSuburb = null,
  initialDate = null,
  initialTime = null,
}: BookInstructorFlowProps) {
  const router = useRouter();
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();

  const preselectedDate = useMemo(
    () => resolveRescheduleDateFromIso(initialDate),
    [initialDate],
  );

  const availableDates = useMemo(
    () => mergeRescheduleDates(buildFutureDates(), preselectedDate),
    [preselectedDate],
  );

  const preselectedTime = initialTime?.trim() || null;

  const preselectedSuburb = initialSuburb?.trim() ?? "";

  const availableCreditHours = 0;

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );

  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  const [selectedDateId, setSelectedDateId] = useState<string | null>(
    preselectedDate?.id ?? null,
  );

  const [calendarMonth, setCalendarMonth] = useState(() =>
    preselectedDate
      ? `${preselectedDate.year}-${String(
          preselectedDate.monthIndex + 1,
        ).padStart(2, "0")}`
      : getCurrentMonth(),
  );

  const [showDatePicker, setShowDatePicker] = useState(!preselectedDate);

  const [selectedTime, setSelectedTime] = useState<string | null>(
    preselectedTime,
  );

  const [pickupAddress, setPickupAddress] = useState("");

  const [pickupAddressDetails, setPickupAddressDetails] =
    useState<AddressSelectionDetails | null>(null);

  const [addressSelected, setAddressSelected] = useState(false);

  const [durationConfirmed, setDurationConfirmed] = useState(false);

  const [showSignUp, setShowSignUp] = useState(false);

  const [showSummary, setShowSummary] = useState(false);

  const [hasRegistered, setHasRegistered] = useState(false);

  const [isConfirmed, setIsConfirmed] = useState(false);

  const [showPayment, setShowPayment] = useState(false);

  const [isContinuing, setIsContinuing] = useState(false);

  const [isContinuingToPayment, setIsContinuingToPayment] = useState(false);

  const [paymentError, setPaymentError] = useState("");

  const mainScrollRef = useRef<HTMLDivElement>(null);

  const addressStepRef = useRef<HTMLElement>(null);

  const durationStepRef = useRef<HTMLElement>(null);

  const dateStepRef = useRef<HTMLElement>(null);

  const timeStepRef = useRef<HTMLElement>(null);

  const summaryStepRef = useRef<HTMLElement>(null);

  const skipInitialScroll = useRef(true);

  const previousFlowStep = useRef<FlowStep | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

  const [bookingId, setBookingId] = useState<string | null>(null);

  function scrollMainToTop() {
    mainScrollRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

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

  const trimmedPickupAddress = pickupAddress.trim();

  const addressComplete = Boolean(
    addressSelected &&
    trimmedPickupAddress.length > 0 &&
    pickupAddressDetails?.suburb &&
    typeof pickupAddressDetails.latitude === "number" &&
    typeof pickupAddressDetails.longitude === "number",
  );

  useEffect(() => {
    if (
      !selectedPackageId ||
      !selectedDateId ||
      !selectedTime ||
      !addressComplete
    ) {
      return;
    }

    if (!pickupAddressDetails?.suburb) {
      return;
    }

    if (
      typeof pickupAddressDetails.latitude !== "number" ||
      typeof pickupAddressDetails.longitude !== "number"
    ) {
      return;
    }

    saveFirstBookingDraft({
      schoolId: instructor.schoolId,
      instructorId: instructor.id,
      selectedPackageId,
      selectedDateId,
      selectedTime,
      pickupAddress: trimmedPickupAddress,
      pickupSuburb: pickupAddressDetails.suburb,
      pickupPostcode: pickupAddressDetails.postcode,
      pickupLatitude: pickupAddressDetails.latitude,
      pickupLongitude: pickupAddressDetails.longitude,
      pickupGooglePlaceId: pickupAddressDetails.googlePlaceId,
    });
  }, [
    addressComplete,
    instructor.id,
    instructor.schoolId,
    pickupAddressDetails?.googlePlaceId,
    pickupAddressDetails?.latitude,
    pickupAddressDetails?.longitude,
    pickupAddressDetails?.postcode,
    pickupAddressDetails?.suburb,
    selectedDateId,
    selectedPackageId,
    selectedTime,
    trimmedPickupAddress,
  ]);

  useEffect(() => {
    if (!isAuthLoaded || !isSignedIn) {
      return;
    }

    const draft = getFirstBookingDraft();

    if (
      draft?.schoolId !== instructor.schoolId ||
      draft.instructorId !== instructor.id
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSelectedPackageId(draft.selectedPackageId);
      setSelectedDateId(draft.selectedDateId);
      setSelectedTime(draft.selectedTime);
      setPickupAddress(draft.pickupAddress);

      setPickupAddressDetails({
        suburb: draft.pickupSuburb,
        postcode: draft.pickupPostcode,
        latitude: draft.pickupLatitude,
        longitude: draft.pickupLongitude,
        googlePlaceId: draft.pickupGooglePlaceId,
      });

      setAddressSelected(true);
      setDurationConfirmed(true);

      setShowDurationPicker(false);
      setShowDatePicker(false);
      setShowTimePicker(false);
      setShowSignUp(false);

      setHasRegistered(true);
      setShowSummary(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [instructor.id, instructor.schoolId, isAuthLoaded, isSignedIn]);

  const packageSuburb = preselectedSuburb;

  const { data: packages = [], isLoading: isLoadingPackages } = useQuery<
    PublicPackage[]
  >({
    queryKey: ["public-packages", instructor.schoolId, packageSuburb],
    queryFn: () => fetchPublicPackages(instructor.schoolId, packageSuburb),
    enabled: packageSuburb.length > 0,
  });

  const selectedPackage =
    packages.find((pkg) => pkg.id === selectedPackageId) ?? null;

  const { data: availableSlots = [], isLoading: isLoadingAvailableSlots } =
    useQuery<PublicAvailableSlot[]>({
      queryKey: [
        "booking-slots",
        instructor.schoolId,
        instructor.id,
        selectedPackage?.id,
        selectedDateIso,
        packageSuburb,
      ],
      queryFn: () =>
        fetchAvailableSlots(
          instructor.id,
          selectedPackage!.id,
          selectedDateIso!,
          packageSuburb,
        ),
      enabled: Boolean(
        durationConfirmed &&
        selectedPackage &&
        selectedDateIso &&
        packageSuburb.length > 0,
      ),
    });

  const availableTimeSlots = useMemo(
    () => Array.from(new Set(availableSlots.map((slot) => slot.startTime))),
    [availableSlots],
  );

  const selectedSlot = useMemo(
    () =>
      availableSlots.find((slot) => slot.startTime === selectedTime) ?? null,
    [availableSlots, selectedTime],
  );

  const selectedHours = selectedPackage
    ? selectedPackage.durationMinutes / 60
    : 0;

  const initialLessonHours = selectedHours >= 3 ? 1 : selectedHours;

  const selectedPackagePrice = selectedPackage
    ? Number(selectedPackage.price)
    : 0;

  const effectiveHourRate =
    selectedHours > 0 ? selectedPackagePrice / selectedHours : 0;

  const payment = calculateOnboardingLessonPayment(
    selectedHours,
    availableCreditHours,
    effectiveHourRate,
  );

  const canConfirm = Boolean(
    selectedPackage &&
    selectedDate &&
    selectedTime &&
    addressComplete &&
    durationConfirmed,
  );

  const showDurationStep = true;

  const showScheduleStep = durationConfirmed;

  const showAddressStep = Boolean(selectedTime);

  const flowStep: FlowStep =
    showSummary && canConfirm && hasRegistered
      ? "summary"
      : !durationConfirmed
        ? "duration"
        : !selectedDate
          ? "date"
          : !selectedTime
            ? "time"
            : !addressComplete
              ? "address"
              : "summary";

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
      address: addressStepRef,
      duration: durationStepRef,
      date: dateStepRef,
      time: timeStepRef,
      summary: summaryStepRef,
    });

    requestAnimationFrame(() => {
      scrollStepIntoView(stepRef.current);
    });
  }, [flowStep]);

  useEffect(() => {
    if (!durationConfirmed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowDurationPicker(true);
    }
  }, [durationConfirmed]);

  useEffect(() => {
    if (
      !selectedTime ||
      isLoadingAvailableSlots ||
      !durationConfirmed ||
      !selectedPackage ||
      !selectedDateIso
    ) {
      return;
    }

    if (!availableTimeSlots.includes(selectedTime)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTime(null);
    }
  }, [
    availableTimeSlots,
    durationConfirmed,
    isLoadingAvailableSlots,
    selectedDateIso,
    selectedPackage,
    selectedTime,
  ]);

  function resetDownstreamFromAddress() {
    setShowSignUp(false);
    setShowSummary(false);
    setHasRegistered(false);
  }

  function handlePickupAddressChange(address: string) {
    setPickupAddress(address);
    setPickupAddressDetails(null);
    setAddressSelected(false);
    resetDownstreamFromAddress();
  }

  function handlePickupAddressSelect(
    address: string,
    details: AddressSelectionDetails,
  ) {
    setPickupAddress(address);
    setPickupAddressDetails(details);

    setAddressSelected(
      Boolean(
        details.suburb &&
        typeof details.latitude === "number" &&
        typeof details.longitude === "number",
      ),
    );

    resetDownstreamFromAddress();
  }

  function confirmDuration() {
    if (!selectedPackage) {
      return;
    }

    setDurationConfirmed(true);
    setSelectedTime(null);
    setShowSignUp(false);
    setShowSummary(false);
    setHasRegistered(false);
    setShowDurationPicker(false);
    setShowDatePicker(!preselectedDate);
  }

  function handlePackageChange(packageId: string) {
    setSelectedPackageId(packageId);
    setDurationConfirmed(false);
    setSelectedTime(null);
    setShowSignUp(false);
    setShowSummary(false);
    setHasRegistered(false);
    setShowDurationPicker(false);
  }

  function handleTimeChange(time: string) {
    setSelectedTime(time);
    setShowSignUp(false);
    setShowSummary(false);
    setHasRegistered(false);
    setShowTimePicker(false);
  }

  async function handleContinueToPayment() {
    if (
      isContinuingToPayment ||
      !selectedPackage ||
      !selectedSlot ||
      !trimmedPickupAddress ||
      !pickupAddressDetails?.suburb ||
      typeof pickupAddressDetails.latitude !== "number" ||
      typeof pickupAddressDetails.longitude !== "number"
    ) {
      return;
    }

    setIsContinuingToPayment(true);
    setPaymentError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      await syncStudent(instructor.schoolId, token);

      const booking = await createBooking(instructor.schoolId, token, {
        instructorId: instructor.id,
        packageId: selectedPackage.id,
        pickupAddress: trimmedPickupAddress,
        pickupSuburb: pickupAddressDetails.suburb,
        pickupPostcode: pickupAddressDetails.postcode,
        pickupLatitude: pickupAddressDetails.latitude,
        pickupLongitude: pickupAddressDetails.longitude,
        pickupGooglePlaceId: pickupAddressDetails.googlePlaceId,
        startDatetime: selectedSlot.startDatetime,
      });

      setBookingId(booking.id);

      const paymentResult = await createPackagePayment(
        instructor.schoolId,
        booking.id,
        token,
      );

      if (!paymentResult.clientSecret) {
        throw new Error("Stripe client secret was not returned");
      }

      setClientSecret(paymentResult.clientSecret);
      setStripeAccountId(paymentResult.stripeAccountId);
      setShowPayment(true);
      scrollMainToTop();
    } catch (error) {
      console.error(error);

      setPaymentError(
        error instanceof Error ? error.message : "Failed to prepare payment",
      );
    } finally {
      setIsContinuingToPayment(false);
    }
  }

  async function handleConfirm() {
    if (!bookingId) {
      throw new Error("Booking ID is missing");
    }

    const token = await getToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const maxAttempts = 20;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const status = await getPackagePaymentStatus(
        instructor.schoolId,
        bookingId,
        token,
      );

      if (
        status.paymentStatus === "paid" &&
        status.bookingStatus === "confirmed"
      ) {
        clearFirstBookingDraft();

        setShowPayment(false);
        setIsConfirmed(true);
        scrollMainToTop();
        return;
      }

      if (status.paymentStatus === "failed") {
        throw new Error("Payment failed");
      }

      if (
        status.bookingStatus === "cancelled" ||
        status.bookingStatus === "expired"
      ) {
        throw new Error("Booking is no longer available");
      }

      await new Promise((resolve) => window.setTimeout(resolve, 500));
    }

    throw new Error(
      "Payment succeeded, but booking confirmation is still processing.",
    );
  }

  const paymentForLesson = {
    ...payment,
    subtotal: payment.subtotal,
    creditDiscount: payment.creditDiscount,
    totalDue: payment.totalDue,
  };

  if (isConfirmed && selectedDate && selectedTime && trimmedPickupAddress) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 pb-24 pt-6 text-center [-webkit-overflow-scrolling:touch]">
        <div className="flex flex-1 flex-col items-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
            ✓
          </div>

          <h1 className="mt-6 text-xl font-bold text-slate-900">
            Lesson booked
          </h1>

          <p className="mt-2 text-sm text-[#4b5563]">
            Payment complete. Your lesson with {instructor.name} is confirmed.
          </p>

          <div className="mt-6 w-full rounded-2xl bg-[#f9f9f9] p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
              {selectedHours} hour lesson
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {formatLessonTimeRange(selectedTime, selectedHours)}
            </p>

            <p className="mt-1 text-sm text-[#4b5563]">
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

  if (
    showSignUp &&
    canConfirm &&
    selectedDate &&
    selectedTime &&
    trimmedPickupAddress
  ) {
    return (
      <BookingSignUp
        onBack={() => setShowSignUp(false)}
        onComplete={() => {
          setHasRegistered(true);
          setShowSignUp(false);
          setShowSummary(true);
          scrollMainToTop();
        }}
      />
    );
  }

  if (
    showPayment &&
    clientSecret &&
    stripeAccountId &&
    canConfirm &&
    hasRegistered &&
    selectedDate &&
    selectedTime &&
    trimmedPickupAddress
  ) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <FlowPageHeader title="Payment" onBack={() => setShowPayment(false)} />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <LessonPayment
            instructor={instructor}
            dateLabel={`${selectedDate.month} ${selectedDate.day} · ${selectedDate.weekday}`}
            timeLabel={formatLessonTimeRange(selectedTime, initialLessonHours)}
            hours={selectedHours}
            lessonHours={initialLessonHours}
            payment={paymentForLesson}
            clientSecret={clientSecret}
            stripeAccountId={stripeAccountId}
            hourRate={effectiveHourRate}
            onBack={() => setShowPayment(false)}
            onComplete={handleConfirm}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mainScrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
    >
      <main className="space-y-6 px-5 pb-24 pt-4">
        <section className="rounded-2xl bg-[#f9f9f9] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
            Instructor
          </p>

          <div className="mt-3">
            <InstructorProfileSummary instructor={instructor} />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-900">
            {typeof instructor.pricePerHour === "number" &&
            instructor.pricePerHour > 0
              ? `${formatCurrency(instructor.pricePerHour)}/hr`
              : "Package pricing"}
          </p>
        </section>

        {showDurationStep && (
          <section ref={durationStepRef} className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Lesson duration
            </h2>

            {isLoadingPackages ? (
              <p className="text-sm text-[#4b5563]">
                Loading lesson packages...
              </p>
            ) : packages.length === 0 ? (
              <p className="text-sm text-[#4b5563]">
                No lesson packages are available for this location.
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowDurationPicker((open) => !open)}
                  className="flex w-full items-center justify-between rounded-xl bg-[#f9f9f9] px-4 py-3 text-left transition hover:bg-[#f0f0f0]"
                >
                  <span
                    className={`text-sm font-medium ${
                      selectedPackage ? "text-slate-900" : "text-[#4b5563]"
                    }`}
                  >
                    {selectedPackage
                      ? `${selectedPackage.name} · ${formatShortLessonHours(
                          selectedHours,
                        )} · ${formatCurrency(selectedPackagePrice)}`
                      : "Select lesson package"}
                  </span>

                  <ChevronRightIcon
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                      showDurationPicker ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {showDurationPicker && (
                  <div className="flex max-h-64 flex-col overflow-y-auto overscroll-y-contain rounded-2xl border border-slate-200 bg-white px-4 py-2">
                    {packages.map((pkg) => {
                      const hours = pkg.durationMinutes / 60;
                      const price = Number(pkg.price);
                      const isSelected = selectedPackageId === pkg.id;

                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => handlePackageChange(pkg.id)}
                          className="flex w-full shrink-0 items-center justify-between gap-3 py-3.5 text-left transition hover:opacity-80"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-900">
                              {pkg.name}
                            </span>

                            <span className="mt-0.5 block text-xs text-[#4b5563]">
                              {formatShortLessonHours(hours)} ·{" "}
                              {formatCurrency(price)} · {packageSuburb}
                            </span>
                          </span>

                          {isSelected ? (
                            <CheckIcon className="h-5 w-5 shrink-0 text-blue-600" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedPackage && payment.payableHours > 0 && (
                  <p className="text-sm text-[#4b5563]">
                    {formatCurrency(payment.totalDue)} due at checkout (
                    {formatLessonHoursLabel(payment.payableHours)} not covered
                    by credit).
                  </p>
                )}

                {selectedPackage && !durationConfirmed && (
                  <button
                    type="button"
                    onClick={confirmDuration}
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Continue
                  </button>
                )}
              </>
            )}
          </section>
        )}

        {showScheduleStep && showDatePicker && (
          <CalendarPickerModal
            title={selectedDate ? "Change date" : "Pick a date"}
            month={calendarMonth}
            availableDates={availableDates}
            selectedDateId={selectedDateId}
            onMonthChange={(month) => {
              setCalendarMonth(month);
              setSelectedDateId(null);
              setSelectedTime(null);
              setShowSignUp(false);
              setShowSummary(false);
              setHasRegistered(false);
            }}
            onSelectDate={(dateId) => {
              setSelectedDateId(dateId);
              setShowDatePicker(false);
              setSelectedTime(null);
              setShowSignUp(false);
              setShowSummary(false);
              setHasRegistered(false);
            }}
            onClose={() => setShowDatePicker(false)}
          />
        )}

        {showScheduleStep && !selectedDate && !showDatePicker && (
          <section ref={dateStepRef} className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Pick a date
            </h2>

            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="flex w-full items-center justify-between rounded-xl bg-[#f9f9f9] px-4 py-3 text-left transition hover:bg-[#f0f0f0]"
            >
              <span className="text-sm font-medium text-[#4b5563]">
                Select date
              </span>

              <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </section>
        )}

        {showScheduleStep && selectedDate && !showDatePicker && (
          <section ref={timeStepRef} className="space-y-3">
            <div className="rounded-2xl bg-[#f9f9f9] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                Selected date
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {selectedDate.month} {selectedDate.day} · {selectedDate.weekday}
              </p>

              <p className="mt-0.5 text-sm text-[#4b5563]">
                {selectedDate.label}
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowDatePicker(true);
                  setShowSignUp(false);
                  setShowSummary(false);
                  setHasRegistered(false);
                }}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Change date
              </button>
            </div>

            <h2 className="text-sm font-semibold text-slate-900">
              Pick a time
            </h2>

            <button
              type="button"
              disabled={
                isLoadingAvailableSlots || availableTimeSlots.length === 0
              }
              onClick={() => setShowTimePicker(true)}
              className="flex w-full items-center justify-between rounded-xl bg-[#f9f9f9] px-4 py-3 text-left transition hover:bg-[#f0f0f0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={`text-sm font-medium ${
                  selectedTime ? "text-slate-900" : "text-[#4b5563]"
                }`}
              >
                {selectedTime ??
                  (isLoadingAvailableSlots
                    ? "Loading available times..."
                    : availableTimeSlots.length > 0
                      ? "Select time"
                      : "No times available")}
              </span>

              <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
            </button>

            {showTimePicker && availableTimeSlots.length > 0 && (
              <TimePickerModal
                timeSlots={availableTimeSlots}
                selectedTime={selectedTime}
                onSelectTime={handleTimeChange}
                onClose={() => setShowTimePicker(false)}
              />
            )}
          </section>
        )}

        {showScheduleStep && selectedTime && (
          <section className="space-y-3">
            <div className="rounded-2xl bg-[#f9f9f9] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                Selected time
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {formatLessonTimeRange(selectedTime, initialLessonHours)}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSelectedTime(null);
                  setShowSignUp(false);
                  setShowSummary(false);
                  setHasRegistered(false);
                }}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Change time
              </button>
            </div>
          </section>
        )}

        {showAddressStep && (
          <section ref={addressStepRef} className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Pick up address
            </h2>

            <GoogleAddressAutocomplete
              id="pickup-address"
              value={pickupAddress}
              onChange={handlePickupAddressChange}
              onSelect={handlePickupAddressSelect}
              placeholder="Enter pick up address"
              inputClassName="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </section>
        )}

        {showScheduleStep &&
          selectedTime &&
          canConfirm &&
          !showSignUp &&
          !showSummary && (
            <section className="space-y-3">
              <button
                type="button"
                aria-busy={isContinuing}
                onClick={() => {
                  if (isContinuing) {
                    return;
                  }

                  setIsContinuing(true);

                  window.setTimeout(() => {
                    if (isSignedIn) {
                      setHasRegistered(true);
                      setShowSummary(true);
                    } else {
                      setShowSignUp(true);
                    }

                    setIsContinuing(false);
                    scrollMainToTop();
                  }, BUTTON_LOADING_MS);
                }}
                className={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 ${
                  isContinuing ? "pointer-events-none" : ""
                }`}
              >
                {isContinuing ? <ButtonSpinner inverse /> : "Continue"}
              </button>
            </section>
          )}

        {showSummary &&
          hasRegistered &&
          canConfirm &&
          selectedDate &&
          selectedTime &&
          trimmedPickupAddress && (
            <section ref={summaryStepRef} className="space-y-3">
              <div className="rounded-2xl bg-[#f9f9f9] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                  Booking summary
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {selectedDate.month} {selectedDate.day} ·{" "}
                  {selectedDate.weekday}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {formatLessonTimeRange(selectedTime, initialLessonHours)}
                </p>

                <p className="mt-1 text-sm text-[#4b5563]">
                  {selectedHours} {selectedHours === 1 ? "hour" : "hours"} ·{" "}
                  {instructor.name}
                </p>

                <p className="mt-1 text-sm text-[#4b5563]">
                  Pick up: {trimmedPickupAddress}
                </p>

                <p className="mt-2 text-sm font-medium text-slate-900">
                  Total: {formatCurrency(payment.totalDue)}
                  {payment.creditHoursUsed > 0 &&
                    ` (${formatCurrency(
                      payment.creditDiscount,
                    )} credit applied)`}
                </p>
              </div>

              {paymentError && (
                <p className="text-sm text-red-500">{paymentError}</p>
              )}

              <button
                type="button"
                aria-busy={isContinuingToPayment}
                onClick={handleContinueToPayment}
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
    </div>
  );
}
