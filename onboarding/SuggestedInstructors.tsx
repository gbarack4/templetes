"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { InstructorProfileSummary } from "@/dashboard/components/InstructorSearch";
import {
  formatCurrency,
  resolveRescheduleDateFromIso,
} from "@/dashboard/mock-data";
import {
  searchPublicInstructors,
  type Transmission,
} from "@/lib/public-booking-api";

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
  isBestMatch = false,
}: Readonly<{
  instructor: PublicInstructor;
  basePath: string;
  queryString: URLSearchParams;
  isBestMatch?: boolean;
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
    <article className="w-full rounded-xl bg-[#f9f9f9] p-3 transition hover:bg-[#f0f0f0]">
      <Link href={profileHref} className="block">
        <div className="flex items-start justify-between gap-3">
          <InstructorProfileSummary instructor={instructor} />

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {typeof instructor.lowestEligiblePrice === "number" &&
            instructor.lowestEligiblePrice > 0 &&
            instructor.lowestEligiblePrice <= 100 ? (
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
                From {formatCurrency(instructor.lowestEligiblePrice)}
              </span>
            ) : null}

            <p className="text-xs text-[#4b5563]">
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

      <div className="mt-3 flex items-center justify-between gap-3">
        <Link
          href={bookHref}
          className="inline-block rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          Book now
        </Link>
        {isBestMatch ? (
          <span className="inline-flex items-center rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            Best match
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function SuggestedInstructors({
  schoolId,
  basePath = "/onboarding",
}: SuggestedInstructorsProps) {
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

  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchInstructors() {
      const normalizedQuery = suburbParam.trim();

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
  }, [schoolId, suburbParam, transmissionParam, preferredDateParam]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-4 pt-4">
        <section className="shrink-0 pb-4">
          <p className="text-xs text-[#4b5563]">
            {loading
              ? "Searching..."
              : `${instructors.length} instructor${
                  instructors.length === 1 ? "" : "s"
                } available nearby`}

            {suburbParam.trim() ? (
              <>
                {" "}
                in{" "}
                <span className="font-medium text-slate-700">
                  {suburbParam.trim()}
                </span>
              </>
            ) : null}
          </p>

          {showLessonPrefs ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDateLabel ? (
                <span className="rounded-full bg-[#f9f9f9] px-3 py-1 text-xs font-medium text-slate-700">
                  {selectedDateLabel}
                </span>
              ) : null}

              {lessonTimeParam ? (
                <span className="rounded-full bg-[#f9f9f9] px-3 py-1 text-xs font-medium text-slate-700">
                  {lessonTimeParam}
                </span>
              ) : null}

              {lessonDurationParam ? (
                <span className="rounded-full bg-[#f9f9f9] px-3 py-1 text-xs font-medium text-slate-700">
                  {lessonDurationParam}
                </span>
              ) : null}

              {transmissionParam ? (
                <span className="rounded-full bg-[#f9f9f9] px-3 py-1 text-xs font-medium capitalize text-slate-700">
                  {transmissionParam}
                </span>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="flex min-h-0 flex-1 flex-col">
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
                  isBestMatch={(instructor.availableSlots?.length ?? 0) > 0}
                />
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">
                No instructors found
                {suburbParam.trim() ? ` for ${suburbParam.trim()}` : ""}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
