"use client";

import { useEffect, useState } from "react";
import type { RescheduleDateOption } from "../mock-data";
import { RescheduleCalendar } from "./RescheduleCalendar";

type CalendarPickerModalProps = Readonly<{
  title: string;
  availableDates: RescheduleDateOption[];
  selectedDateId: string | null;
  onSelectDate: (dateId: string) => void;
  onClose: () => void;
  showSlotLabels?: boolean;
}>;

export function CalendarPickerModal({
  title,
  availableDates,
  selectedDateId,
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
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full max-w-md rounded-t-[1.75rem] bg-white px-5 pb-6 pt-3 shadow-xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
        <h2 className="mb-5 text-center text-lg font-bold text-slate-900">
          Select date
        </h2>
        <RescheduleCalendar
          availableDates={availableDates}
          selectedDateId={selectedDateId}
          showSlotLabels={showSlotLabels}
          onSelectDate={(dateId) => {
            onSelectDate(dateId);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
