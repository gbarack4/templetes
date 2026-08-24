"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { formatCurrency, type InstructorOption } from "../mock-data";

type InstructorSearchProps = Readonly<{
  instructors: InstructorOption[];
  onSelect: (instructorId: string) => void;
  onCancel?: () => void;
  title?: string;
}>;

export function InstructorProfileSummary({
  instructor,
  compact = false,
}: Readonly<{ instructor: InstructorOption; compact?: boolean }>) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = compact ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  const showImage = Boolean(instructor.avatarUrl) && !imageError;

  return (
    <div className={`flex min-w-0 flex-1 ${compact ? "gap-2.5" : "gap-3"}`}>
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 font-semibold text-slate-600 ${sizeClass}`}
      >
        {showImage ? (
          <Image
            src={instructor.avatarUrl}
            alt={`${instructor.name}'s profile`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes={compact ? "36px" : "48px"}
          />
        ) : (
          instructor.initials
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold text-slate-900 ${compact ? "text-sm leading-tight" : "text-sm"}`}
        >
          {instructor.name}
        </p>
        <p className="mt-0.5 text-xs font-medium text-amber-600">
          ★ {instructor.rating.toFixed(1)} · {instructor.reviewCount} reviews
        </p>
        {!compact ? (
          <p className="mt-0.5 text-xs text-slate-500">
            {instructor.lessonsCompleted.toLocaleString()} lessons completed
          </p>
        ) : null}
      </div>
    </div>
  );
}

function InstructorProfileCard({
  instructor,
  onSelect,
}: Readonly<{
  instructor: InstructorOption;
  onSelect: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl bg-slate-50 p-3 text-left transition hover:bg-slate-100"
    >
      <div className="flex items-start justify-between gap-3">
        <InstructorProfileSummary instructor={instructor} />
        <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
          {formatCurrency(instructor.pricePerHour)}/hr
        </span>
      </div>
    </button>
  );
}

export function InstructorSearch({
  instructors,
  onSelect,
  onCancel,
  title = "Change instructor",
}: InstructorSearchProps) {
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return instructors;

    return instructors.filter(
      (instructor) =>
        instructor.name.toLowerCase().includes(trimmed) ||
        instructor.location.toLowerCase().includes(trimmed),
    );
  }, [instructors, query]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        )}
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search instructors..."
        autoFocus
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <div className="space-y-2">
        {suggestions.length > 0 ? (
          suggestions.map((instructor) => (
            <InstructorProfileCard
              key={instructor.id}
              instructor={instructor}
              onSelect={() => onSelect(instructor.id)}
            />
          ))
        ) : (
          <p className="py-4 text-center text-sm text-slate-400">
            No instructors found
          </p>
        )}
      </div>
    </section>
  );
}
