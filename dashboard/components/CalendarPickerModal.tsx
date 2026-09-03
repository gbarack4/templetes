"use client";

import { useEffect, useState } from "react";

import type { RescheduleDateOption } from "../mock-data";
import { RescheduleCalendar } from "./RescheduleCalendar";

type CalendarPickerModalProps = Readonly<{
  title: string;
  month: string;
  availableDates: RescheduleDateOption[];
  selectedDateId: string | null;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onMonthChange: (month: string) => void;
  onSelectDate: (dateId: string) => void;
  onClose: () => void;
  showSlotLabels?: boolean;
}>;

export function CalendarPickerModal({
  title,
  month,
  availableDates,
  selectedDateId,
  loading = false,
  error = "",
  onRetry,
  onMonthChange,
  onSelectDate,
  onClose,
  showSlotLabels = true,
}: CalendarPickerModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const frameId = window.requestAnimationFrame(() => setIsVisible(true));

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close calendar"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <dialog
        open
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full max-w-md rounded-t-[1.75rem] bg-white px-5 pb-6 pt-3 shadow-xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

        <h2 className="mb-5 text-center text-lg font-bold text-slate-900">
          {title}
        </h2>

        <RescheduleCalendar
          month={month}
          availableDates={availableDates}
          selectedDateId={selectedDateId}
          showSlotLabels={showSlotLabels}
          onMonthChange={onMonthChange}
          onSelectDate={(dateId) => {
            onSelectDate(dateId);
            onClose();
          }}
        />

        {loading && (
          <p className="mt-4 text-center text-sm text-slate-500">
            Loading availability...
          </p>
        )}

        {!loading && error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
            <p>{error}</p>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 font-medium underline"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {!loading && !error && availableDates.length === 0 && (
          <p className="mt-4 text-center text-sm text-slate-500">
            No available times for this month.
          </p>
        )}
      </dialog>
    </div>
  );
}
