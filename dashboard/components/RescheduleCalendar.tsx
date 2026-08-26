"use client";

import { useMemo, useState } from "react";
import type { RescheduleDateOption } from "../mock-data";
import { ChevronLeftIcon } from "./icons";

type RescheduleCalendarProps = Readonly<{
  availableDates: RescheduleDateOption[];
  selectedDateId: string | null;
  onSelectDate: (dateId: string) => void;
}>;

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function ChevronRightIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type DayStatus = "open" | "full" | "unavailable";

export function RescheduleCalendar({
  availableDates,
  selectedDateId,
  onSelectDate,
}: RescheduleCalendarProps) {
  const datesByDay = useMemo(() => {
    const map = new Map<string, RescheduleDateOption>();
    for (const date of availableDates) {
      map.set(`${date.year}-${date.monthIndex}-${date.day}`, date);
    }
    return map;
  }, [availableDates]);

  const monthRange = useMemo(() => {
    if (availableDates.length === 0) {
      const now = new Date();
      return {
        minMonth: now.getMonth(),
        minYear: now.getFullYear(),
        maxMonth: now.getMonth(),
        maxYear: now.getFullYear(),
      };
    }

    const sorted = [...availableDates].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    return {
      minMonth: first.monthIndex,
      minYear: first.year,
      maxMonth: last.monthIndex,
      maxYear: last.year,
    };
  }, [availableDates]);

  const [viewYear, setViewYear] = useState(monthRange.minYear);
  const [viewMonth, setViewMonth] = useState(monthRange.minMonth);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number | null }> = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push({ day: null });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ day: null });
    }

    return cells;
  }, [viewMonth, viewYear]);

  const canGoPrevious =
    viewYear > monthRange.minYear ||
    (viewYear === monthRange.minYear && viewMonth > monthRange.minMonth);

  const canGoNext =
    viewYear < monthRange.maxYear ||
    (viewYear === monthRange.maxYear && viewMonth < monthRange.maxMonth);

  function goToPreviousMonth() {
    if (!canGoPrevious) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
      return;
    }
    setViewMonth((month) => month - 1);
  }

  function goToNextMonth() {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
      return;
    }
    setViewMonth((month) => month + 1);
  }

  function getDayStatus(day: number): {
    status: DayStatus;
    date: RescheduleDateOption | null;
  } {
    const date = datesByDay.get(`${viewYear}-${viewMonth}-${day}`) ?? null;
    if (!date) return { status: "unavailable", date: null };
    if (date.availability === "full" || date.slotCount <= 0) {
      return { status: "full", date };
    }
    return { status: "open", date };
  }

  return (
    <div className="bg-white">
      <div className="mb-4 flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="Previous month"
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#f9f9f9] hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <p className="text-base font-semibold text-slate-900">{monthLabel}</p>
        <button
          type="button"
          aria-label="Next month"
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#f9f9f9] hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-xs font-medium text-slate-400"
          >
            {label}
          </div>
        ))}

        {calendarDays.map((cell, index) => {
          if (cell.day === null) {
            return <div key={`empty-${index}`} className="min-h-[3.25rem]" />;
          }

          const dateKey = `${viewYear}-${viewMonth}-${cell.day}`;
          const { status, date } = getDayStatus(cell.day);
          const isSelected = date?.id === selectedDateId;
          const isOpen = status === "open";

          return (
            <button
              key={dateKey}
              type="button"
              disabled={!isOpen}
              onClick={() => date && isOpen && onSelectDate(date.id)}
              className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 py-1.5 transition ${
                isOpen
                  ? isSelected
                    ? "bg-slate-900 text-white"
                    : "bg-[#f9f9f9] text-slate-900 hover:bg-slate-200/80"
                  : "cursor-default bg-transparent text-slate-300"
              }`}
            >
              <span
                className={`text-sm font-semibold leading-none ${
                  isOpen
                    ? isSelected
                      ? "text-white"
                      : "text-slate-900"
                    : "text-slate-300"
                }`}
              >
                {cell.day}
              </span>
              <span
                className={`max-w-full truncate leading-none ${
                  status === "unavailable"
                    ? "text-[7px] tracking-tight text-slate-300"
                    : isOpen
                      ? isSelected
                        ? "text-[9px] text-white/80"
                        : "text-[9px] text-slate-400"
                      : "text-[9px] text-slate-300"
                }`}
              >
                {status === "open"
                  ? `slot ${date?.slotCount ?? 0}`
                  : status === "full"
                    ? "full"
                    : "unavailable"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getSelectedRescheduleDate(
  availableDates: RescheduleDateOption[],
  selectedDateId: string | null,
) {
  const selected =
    availableDates.find((date) => date.id === selectedDateId) ?? null;
  if (!selected || selected.availability === "full" || selected.slotCount <= 0) {
    return null;
  }
  return selected;
}
