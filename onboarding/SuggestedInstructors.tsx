"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { InstructorProfileSummary } from "@/dashboard/components/InstructorSearch";
import { ChevronLeftIcon } from "@/dashboard/components/icons";
import {
  formatCurrency,
  resolveRescheduleDateFromIso,
} from "@/dashboard/mock-data";
import {
  searchPublicInstructors,
  type Transmission,
} from "@/lib/public-booking-api";
import { SuburbAutocomplete } from "@/templates/SuburbAutocomplete";

import { withOnboardingQuery } from "./paths";
import { PublicInstructor } from "./suggested-instructors";

type SuggestedInstructorsProps = Readonly<{
  schoolId: string;
  basePath?: string;
}>;

function normalizeTransmission(value: string | null): Transmission | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "auto" || normalized === "automatic") {
    return "automatic";
  }

  if (normalized === "manual") {
    return "manual";
  }

  return undefined;
}

function SuggestedInstructorCard({
  instructor,
  basePath,
  queryString,
}: Readonly<{
  instructor: PublicInstructor;
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
              {[instructor.suburb, instructor.postcode]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <p className="text-xs font-medium text-slate-700">
              {instructor.availableSlots?.length ?? 0}{" "}
              {(instructor.availableSlots?.length ?? 0) === 1
                ? "slot"
                : "slots"}{" "}
              available
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

export function SuggestedInstructors({
  schoolId,
  basePath = "/onboarding",
}: SuggestedInstructorsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const suburbParam = searchParams.get("suburb") ?? "";
  const transmissionParam = normalizeTransmission(
    searchParams.get("transmission"),
  );
  const preferredDateParam = searchParams.get("preferredDate");
  const lessonTimeParam = searchParams.get("lessonTime");
  const lessonDurationParam = searchParams.get("lessonDuration");

  const showLessonPrefs = Boolean(
    preferredDateParam ||
    lessonTimeParam ||
    lessonDurationParam ||
    transmissionParam,
  );

  const selectedDateLabel = preferredDateParam
    ? (resolveRescheduleDateFromIso(preferredDateParam)?.label ??
      preferredDateParam)
    : null;

  const [query, setQuery] = useState(suburbParam);
  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(suburbParam);
  }, [suburbParam]);

  useEffect(() => {
    let isMounted = true;

    async function fetchInstructors() {
      const normalizedQuery = query.trim();

      if (!normalizedQuery) {
        setInstructors([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await searchPublicInstructors(
          schoolId,
          normalizedQuery,
          transmissionParam,
          preferredDateParam ?? undefined,
        );

        if (isMounted) {
          setInstructors(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setInstructors([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchInstructors();

    return () => {
      isMounted = false;
    };
  }, [schoolId, query, transmissionParam, preferredDateParam]);

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
            {loading
              ? "Searching..."
              : `${instructors.length} instructor${
                  instructors.length === 1 ? "" : "s"
                } available nearby`}

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

          {showLessonPrefs ? (
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
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
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
            {loading ? (
              <p className="py-4 text-center text-sm text-slate-400">
                Loading instructors...
              </p>
            ) : instructors.length > 0 ? (
              instructors.map((instructor) => (
                <SuggestedInstructorCard
                  key={instructor.id}
                  instructor={instructor}
                  basePath={basePath}
                  queryString={searchParams}
                />
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">
                No instructors found
                {query.trim() ? ` for ${query.trim()}` : ""}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
