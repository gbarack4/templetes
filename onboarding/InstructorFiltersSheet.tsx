"use client";

import { useEffect, useMemo, useState } from "react";

import { CalendarPickerModal } from "@/dashboard/components/CalendarPickerModal";
import { getSelectedRescheduleDate } from "@/dashboard/components/RescheduleCalendar";
import { TimePickerModal } from "@/dashboard/components/TimePickerModal";
import { CalendarIcon, CloseIcon } from "@/dashboard/components/icons";
import {
  buildFutureDates,
  mockRescheduleTimeSlots,
  resolveRescheduleDateFromIso,
} from "@/dashboard/mock-data";
import { getCurrentMonth } from "@/shared/utils/get-current-month";
import { mockModernLessonDurations } from "@/templates/resolve-modern-site";

type TransmissionFilter = "automatic" | "manual";

export type InstructorFiltersDraft = Readonly<{
  transmission: TransmissionFilter | null;
  preferredDate: string | null;
  lessonTime: string | null;
  lessonDuration: string | null;
}>;

type InstructorFiltersSheetProps = Readonly<{
  initialFilters: InstructorFiltersDraft;
  onApply: (filters: InstructorFiltersDraft) => void;
  onClose: () => void;
}>;

const TRANSMISSION_OPTIONS: ReadonlyArray<{
  value: TransmissionFilter;
  label: string;
}> = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

const DURATION_OPTIONS = [...mockModernLessonDurations];

function ClockGlyph({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function toIsoDate(date: {
  year: number;
  monthIndex: number;
  day: number;
}): string {
  return `${date.year}-${String(date.monthIndex + 1).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

function countActiveFilters(filters: InstructorFiltersDraft): number {
  return [
    filters.transmission,
    filters.preferredDate,
    filters.lessonTime,
    filters.lessonDuration,
  ].filter(Boolean).length;
}

export function InstructorFiltersSheet({
  initialFilters,
  onApply,
  onClose,
}: InstructorFiltersSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [draft, setDraft] = useState<InstructorFiltersDraft>(initialFilters);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(getCurrentMonth);

  const availableDates = useMemo(() => buildFutureDates(), []);
  const selectedDate = resolveRescheduleDateFromIso(
    draft.preferredDate,
    availableDates,
  );
  const selectedDateId = selectedDate?.id ?? null;
  const draftFilterCount = countActiveFilters(draft);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (showDatePicker || showTimePicker) return;
      onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const frameId = window.requestAnimationFrame(() => setIsVisible(true));

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, showDatePicker, showTimePicker]);

  useEffect(() => {
    if (!showDatePicker && !showTimePicker) {
      document.body.style.overflow = "hidden";
    }
  }, [showDatePicker, showTimePicker]);

  function clearAll() {
    setDraft({
      transmission: null,
      preferredDate: null,
      lessonTime: null,
      lessonDuration: null,
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <button
          type="button"
          aria-label="Close filters"
          onClick={onClose}
          className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filters-sheet-title"
          className={`relative z-10 flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-[1.75rem] bg-white px-5 pb-6 pt-3 shadow-xl transition-transform duration-300 ease-out ${
            isVisible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-200" />

          <div className="mb-5 flex shrink-0 items-center justify-between gap-3">
            <h2
              id="filters-sheet-title"
              className="text-lg font-bold text-slate-900"
            >
              Filters
            </h2>

            <div className="flex items-center gap-2">
              {draftFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#4b5563] transition hover:bg-[#f9f9f9] hover:text-slate-900"
                >
                  Clear all
                </button>
              ) : null}

              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f9f9f9] text-slate-600 transition hover:bg-slate-200"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-y-contain pb-4">
            <section className="space-y-2.5">
              <p className="text-sm font-semibold text-slate-900">
                Transmission
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TRANSMISSION_OPTIONS.map((option) => {
                  const isSelected = draft.transmission === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          transmission: isSelected ? null : option.value,
                        }))
                      }
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-[#f9f9f9] text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2.5">
              <p className="text-sm font-semibold text-slate-900">
                Preferred date
              </p>
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="flex h-11 w-full items-center gap-3 rounded-lg bg-[#f9f9f9] px-3.5 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                <CalendarIcon className="h-4 w-4 shrink-0 text-slate-500" />
                <span
                  className={`min-w-0 flex-1 ${
                    selectedDate ? "text-slate-900" : "font-medium text-[#4b5563]"
                  }`}
                >
                  {selectedDate?.label ?? "Any date"}
                </span>
              </button>
            </section>

            <section className="space-y-2.5">
              <p className="text-sm font-semibold text-slate-900">
                Preferred time
              </p>
              <button
                type="button"
                onClick={() => setShowTimePicker(true)}
                className="flex h-11 w-full items-center gap-3 rounded-lg bg-[#f9f9f9] px-3.5 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                <ClockGlyph className="h-4 w-4 shrink-0 text-slate-500" />
                <span
                  className={`min-w-0 flex-1 ${
                    draft.lessonTime
                      ? "text-slate-900"
                      : "font-medium text-[#4b5563]"
                  }`}
                >
                  {draft.lessonTime ?? "Any time"}
                </span>
              </button>
            </section>

            <section className="space-y-2.5">
              <p className="text-sm font-semibold text-slate-900">
                Lesson duration
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((duration) => {
                  const isSelected = draft.lessonDuration === duration;

                  return (
                    <button
                      key={duration}
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          lessonDuration: isSelected ? null : duration,
                        }))
                      }
                      className={`rounded-lg px-2 py-2.5 text-center text-xs font-semibold transition ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-[#f9f9f9] text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {duration}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="mt-2 flex shrink-0 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-lg bg-[#f9f9f9] text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onApply(draft)}
              className="h-12 flex-1 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>

      {showDatePicker ? (
        <CalendarPickerModal
          title="Preferred date"
          month={calendarMonth}
          availableDates={availableDates}
          selectedDateId={selectedDateId}
          onMonthChange={(month) => {
            setCalendarMonth(month);
          }}
          onSelectDate={(dateId) => {
            const next = getSelectedRescheduleDate(availableDates, dateId);
            setDraft((current) => ({
              ...current,
              preferredDate: next ? toIsoDate(next) : null,
            }));
            setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
          showSlotLabels={false}
        />
      ) : null}

      {showTimePicker ? (
        <TimePickerModal
          title="Preferred time"
          timeSlots={mockRescheduleTimeSlots}
          selectedTime={draft.lessonTime}
          onSelectTime={(time) => {
            setDraft((current) => ({
              ...current,
              lessonTime: time,
            }));
          }}
          onClose={() => setShowTimePicker(false)}
        />
      ) : null}
    </>
  );
}
