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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function InstructorProfileSummary({
  instructor,
  compact = false,
}: Readonly<{ instructor: InstructorOption; compact?: boolean }>) {
  const [imageError, setImageError] = useState(false);

  const sizeClass = compact ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  const showImage = Boolean(instructor.avatarUrl) && !imageError;

  const initials = instructor.initials || getInitials(instructor.name);
  const rating = instructor.rating ?? null;
  const reviewCount = instructor.reviewCount ?? 0;
  const lessonsCompleted = instructor.lessonsCompleted ?? 0;

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
          initials
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold text-slate-900 ${
            compact ? "text-sm leading-tight" : "text-sm"
          }`}
        >
          {instructor.name}
        </p>

        {rating !== null && reviewCount > 0 ? (
          <div className="mt-0.5 flex items-center gap-1.5">
            <div
              className="flex gap-0.5"
              aria-label={`${rating.toFixed(1)} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xs leading-none ${
                    star <= Math.round(rating)
                      ? "text-yellow-500"
                      : "text-slate-200"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {rating.toFixed(1)} · {reviewCount} reviews
            </p>
          </div>
        ) : (
          <p className="mt-0.5 text-xs text-slate-400">No reviews yet</p>
        )}

        {!compact ? (
          <p className="mt-0.5 text-xs text-slate-500">
            {lessonsCompleted > 0
              ? `${lessonsCompleted.toLocaleString()} lessons completed`
              : "No completed lessons yet"}
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
  const pricePerHour = instructor.pricePerHour;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl bg-[#f9f9f9] p-3 text-left transition hover:bg-[#f0f0f0]"
    >
      <div className="flex items-start justify-between gap-3">
        <InstructorProfileSummary instructor={instructor} />

        <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
          {pricePerHour != null
            ? `${formatCurrency(pricePerHour)}/hr`
            : "Price on request"}
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

    if (!trimmed) {
      return instructors;
    }

    return instructors.filter((instructor) => {
      const name = instructor.name?.toLowerCase() ?? "";
      const location = instructor.location?.toLowerCase() ?? "";

      return name.includes(trimmed) || location.includes(trimmed);
    });
  }, [instructors, query]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        ) : null}
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
