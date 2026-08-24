"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { InstructorProfileSummary } from "@/dashboard/components/InstructorSearch";
import { ChevronLeftIcon } from "@/dashboard/components/icons";
import {
  formatCurrency,
  resolveRescheduleDateFromIso,
} from "@/dashboard/mock-data";
import { SuburbAutocomplete } from "@/templates/SuburbAutocomplete";
import { withOnboardingQuery } from "./paths";
import {
  getInstructorsForSuburb,
  instructorProfileDetails,
  suggestedInstructorsInArea,
  type SuggestedInstructor,
} from "./suggested-instructors";

type SuggestedInstructorsProps = Readonly<{
  basePath?: string;
}>;

function SuggestedInstructorCard({
  instructor,
  basePath,
  queryString,
}: Readonly<{
  instructor: SuggestedInstructor;
  basePath: string;
  queryString: URLSearchParams;
}>) {
  const profileHref = withOnboardingQuery(
    `${basePath}/instructor/${instructor.id}`,
    queryString,
  );
  const bookHref = withOnboardingQuery(
    `${basePath}/book/${instructor.id}`,
    queryString,
  );

  return (
    <article className="w-full rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100">
      <Link href={profileHref} className="block">
        <div className="flex items-start justify-between gap-3">
          <InstructorProfileSummary instructor={instructor} />
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
              {formatCurrency(instructor.pricePerHour)}/hr
            </span>
            <p className="text-xs text-slate-500">
              {instructor.suburb} · {instructor.postcode}
            </p>
            <p className="text-xs font-medium text-slate-700">
              {instructor.availableSlots}{" "}
              {instructor.availableSlots === 1 ? "slot" : "slots"} available
            </p>
          </div>
        </div>
      </Link>
      <Link
        href={bookHref}
        className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
      >
        Book now
      </Link>
    </article>
  );
}

function matchesTransmission(
  instructorId: string,
  transmission: string | null,
): boolean {
  if (!transmission) return true;

  const car = instructorProfileDetails[instructorId]?.car;
  if (!car) return true;

  const normalized = transmission.toLowerCase();
  const carTransmission = car.transmission.toLowerCase();
  return normalized === "auto"
    ? carTransmission.includes("auto")
    : carTransmission.includes("manual");
}

export function SuggestedInstructors({
  basePath = "/preview/onboarding",
}: SuggestedInstructorsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suburbParam = searchParams.get("suburb") ?? "";
  const transmissionParam = searchParams.get("transmission");
  const testDateParam = searchParams.get("testDate");
  const lessonTimeParam = searchParams.get("lessonTime");
  const lessonDurationParam = searchParams.get("lessonDuration");
  // Modern template carries lesson time/duration; Classic only sends optional test date.
  const showModernLessonPrefs = Boolean(lessonTimeParam || lessonDurationParam);
  const selectedDateLabel = testDateParam
    ? resolveRescheduleDateFromIso(testDateParam)?.label ?? testDateParam
    : null;
  const [query, setQuery] = useState(suburbParam);

  useEffect(() => {
    setQuery(suburbParam);
  }, [suburbParam]);

  const filteredInstructors = useMemo(() => {
    return getInstructorsForSuburb(query, suggestedInstructorsInArea).filter(
      (instructor) => matchesTransmission(instructor.id, transmissionParam),
    );
  }, [query, transmissionParam]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center px-5 pt-4">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-50"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-4 pt-2">
        <section className="shrink-0 pb-4">
          <SuburbAutocomplete
            id="onboarding-suburb-search"
            value={query}
            onChange={setQuery}
            placeholder="Search by suburb or postcode"
            inputClassName="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-2 text-xs text-slate-500">
            {filteredInstructors.length} instructor
            {filteredInstructors.length === 1 ? "" : "s"} available nearby
            {query.trim() ? (
              <>
                {" "}
                in{" "}
                <span className="font-medium text-slate-700">
                  {query.trim()}
                </span>
              </>
            ) : null}
          </p>
          {showModernLessonPrefs ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDateLabel ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {selectedDateLabel}
                </span>
              ) : null}
              {lessonTimeParam ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {lessonTimeParam}
                </span>
              ) : null}
              {lessonDurationParam ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {lessonDurationParam}
                </span>
              ) : null}
              {transmissionParam ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {transmissionParam}
                </span>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="flex min-h-0 flex-1 flex-col">
          <h2 className="shrink-0 pb-3 text-sm font-semibold text-slate-900">
            Suggested instructors
          </h2>
          <div className="instructor-list-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain scroll-smooth pb-4 pt-1 [-webkit-overflow-scrolling:touch]">
            {filteredInstructors.length > 0 ? (
              filteredInstructors.map((instructor) => (
                <SuggestedInstructorCard
                  key={instructor.id}
                  instructor={instructor}
                  basePath={basePath}
                  queryString={searchParams}
                />
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">
                No instructors found{query.trim() ? ` for ${query.trim()}` : ""}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
