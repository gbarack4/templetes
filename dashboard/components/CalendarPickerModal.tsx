"use client";

import { useEffect } from "react";
import type { RescheduleDateOption } from "../mock-data";
import { RescheduleCalendar } from "./RescheduleCalendar";

type CalendarPickerModalProps = Readonly<{
  title: string;
  availableDates: RescheduleDateOption[];
  selectedDateId: string | null;
  onSelectDate: (dateId: string) => void;
  onClose: () => void;
}>;

export function CalendarPickerModal({
  title,
  availableDates,
  selectedDateId,
  onSelectDate,
  onClose,
}: CalendarPickerModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
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
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-picker-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="calendar-picker-title" className="text-base font-bold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Close
          </button>
        </div>

        <RescheduleCalendar
          availableDates={availableDates}
          selectedDateId={selectedDateId}
          onSelectDate={(dateId) => {
            onSelectDate(dateId);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
