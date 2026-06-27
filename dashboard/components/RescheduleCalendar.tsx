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

export function RescheduleCalendar({
  availableDates,
  selectedDateId,
  onSelectDate,
}: RescheduleCalendarProps) {
  const availableByDay = useMemo(() => {
    const map = new Map<string, RescheduleDateOption>();
    for (const date of availableDates) {
      map.set(`${date.year}-${date.monthIndex}-${date.day}`, date);
    }
    return map;
  }, [availableDates]);

  const monthRange = useMemo(() => {
    if (availableDates.length === 0) {
      return { minMonth: 0, minYear: 2026, maxMonth: 0, maxYear: 2026 };
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

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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

  const availableThisMonth = useMemo(
    () =>
      availableDates.filter(
        (date) => date.year === viewYear && date.monthIndex === viewMonth,
      ).length,
    [availableDates, viewMonth, viewYear],
  );

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

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between bg-blue-600 px-3 py-2.5 text-white">
        <button
          type="button"
          aria-label="Previous month"
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious}
          className="rounded-lg p-1 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold">{monthLabel}</p>
        <button
          type="button"
          aria-label="Next month"
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className="rounded-lg p-1 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-100 px-px pt-px">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-slate-50 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          >
            {label}
          </div>
        ))}

        {calendarDays.map((cell, index) => {
          if (cell.day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="h-9 bg-white"
              />
            );
          }

          const dateKey = `${viewYear}-${viewMonth}-${cell.day}`;
          const availableDate = availableByDay.get(dateKey);
          const isSelected = availableDate?.id === selectedDateId;
          const isAvailable = Boolean(availableDate);
          const dayOfWeek = new Date(viewYear, viewMonth, cell.day).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={!isAvailable}
              onClick={() => availableDate && onSelectDate(availableDate.id)}
              className={`relative h-9 bg-white transition ${
                isWeekend && !isSelected ? "bg-slate-50/80" : ""
              } ${isAvailable ? "hover:bg-blue-50" : "cursor-default"}`}
            >
              <span
                className={`absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-medium ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : isAvailable
                      ? "text-slate-900"
                      : "text-slate-300"
                }`}
              >
                {cell.day}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          Available
        </span>
        <span>
          {availableThisMonth > 0
            ? `${availableThisMonth} slots this month`
            : "No slots this month"}
        </span>
      </div>
    </div>
  );
}

export function getSelectedRescheduleDate(
  availableDates: RescheduleDateOption[],
  selectedDateId: string | null,
) {
  return availableDates.find((date) => date.id === selectedDateId) ?? null;
}
