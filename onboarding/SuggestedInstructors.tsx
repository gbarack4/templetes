"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InstructorProfileSummary } from "@/dashboard/components/InstructorSearch";
import { formatCurrency } from "@/dashboard/mock-data";
import {
  mockStudentArea,
  onboardingBookPath,
  onboardingInstructorProfilePath,
  suggestedInstructorsInArea,
  type SuggestedInstructor,
} from "./suggested-instructors";

function SuggestedInstructorCard({
  instructor,
}: Readonly<{
  instructor: SuggestedInstructor;
}>) {
  return (
    <article className="w-full rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100">
      <Link
        href={`${onboardingInstructorProfilePath}/${instructor.id}`}
        className="block"
      >
        <div className="flex items-start justify-between gap-3">
          <InstructorProfileSummary instructor={instructor} />
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            {formatCurrency(instructor.pricePerHour)}/hr
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {instructor.suburb} · {instructor.postcode}
        </p>
      </Link>
      <Link
        href={`${onboardingBookPath}/${instructor.id}`}
        className="mt-3 inline-block rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-slate-50"
      >
        Book now
      </Link>
    </article>
  );
}

export function SuggestedInstructors() {
  const [query, setQuery] = useState("");

  const filteredInstructors = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const normalizedPostcode = query.replace(/\s/g, "").toLowerCase();
    if (!trimmed) return suggestedInstructorsInArea;

    return suggestedInstructorsInArea.filter(
      (instructor) =>
        instructor.suburb.toLowerCase().includes(trimmed) ||
        instructor.postcode.toLowerCase().includes(normalizedPostcode) ||
        mockStudentArea.suburb.toLowerCase().includes(trimmed) ||
        mockStudentArea.postcode.toLowerCase().includes(normalizedPostcode),
    );
  }, [query]);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-4 pt-10">
      <section className="shrink-0 pb-4">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by suburb or postcode"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <p className="mt-2 text-xs text-slate-500">
          {filteredInstructors.length} instructor
          {filteredInstructors.length === 1 ? "" : "s"} available nearby
        </p>
      </section>

      <section className="flex min-h-0 flex-1 flex-col">
        <h2 className="shrink-0 pb-3 text-sm font-semibold text-slate-900">
          Suggested instructors
        </h2>
        <div className="instructor-list-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain scroll-smooth pb-4 pt-1 [-webkit-overflow-scrolling:touch]">
          {filteredInstructors.length > 0 ? (
            filteredInstructors.map((instructor) => (
              <SuggestedInstructorCard key={instructor.id} instructor={instructor} />
            ))
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">No instructors found</p>
          )}
        </div>
      </section>
    </main>
  );
}
