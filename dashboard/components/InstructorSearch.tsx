"use client";

import { useMemo, useState } from "react";
import type { InstructorOption } from "../mock-data";

type InstructorSearchProps = Readonly<{
  instructors: InstructorOption[];
  onSelect: (instructorId: string) => void;
  onCancel?: () => void;
  title?: string;
}>;

export function InstructorProfileSummary({
  instructor,
}: Readonly<{ instructor: InstructorOption }>) {
  return (
    <div className="flex gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
        {instructor.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{instructor.name}</p>
        <p className="mt-0.5 text-xs font-medium text-amber-600">
          ★ {instructor.rating.toFixed(1)} · {instructor.reviewCount} reviews
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {instructor.lessonsCompleted.toLocaleString()} lessons completed
        </p>
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
      <InstructorProfileSummary instructor={instructor} />
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
