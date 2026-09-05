"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ChevronDownIcon,
  FiltersIcon,
} from "@/dashboard/components/icons";
import { InstructorProfileSummary } from "@/dashboard/components/InstructorSearch";
import {
  formatCurrency,
  resolveRescheduleDateFromIso,
} from "@/dashboard/mock-data";
import {
  searchPublicInstructors,
  type Transmission,
} from "@/lib/public-booking-api";

import {
  InstructorFiltersSheet,
  type InstructorFiltersDraft,
} from "./InstructorFiltersSheet";
import { withOnboardingQuery } from "./paths";
import {
  getInstructorsForSuburb,
  toPublicInstructor,
  type PublicInstructor,
} from "./suggested-instructors";

type SuggestedInstructorsProps = Readonly<{
  schoolId?: string;
  basePath?: string;
  useMock?: boolean;
}>;

type SortOption = "price-asc" | "price-desc" | "rating-desc";

const SORT_OPTIONS: ReadonlyArray<{ value: SortOption; label: string }> = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Rating: High to Low" },
];

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

function getInstructorSortPrice(instructor: PublicInstructor): number {
  if (
    typeof instructor.lowestEligiblePrice === "number" &&
    instructor.lowestEligiblePrice > 0
  ) {
    return instructor.lowestEligiblePrice;
  }

  return instructor.pricePerHour ?? Number.POSITIVE_INFINITY;
}

function SuggestedInstructorCard({
  instructor,
  basePath,
  queryString,
  searchedSuburb,
  searchedPostcode,
  isBestMatch = false,
}: Readonly<{
  instructor: PublicInstructor;
  basePath: string;
  queryString: URLSearchParams;
  searchedSuburb: string;
  searchedPostcode: string;
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
              {[searchedSuburb, searchedPostcode].filter(Boolean).join(" · ")}
            </p>

            <p className="text-xs font-medium text-slate-700">
              {instructor.monthlyAvailableSlotCount}{" "}
              {instructor.monthlyAvailableSlotCount === 1 ? "slot" : "slots"}{" "}
              available this month
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

function InstructorCardSkeleton() {
  return (
    <div className="instructor-skeleton w-full rounded-xl bg-[#f9f9f9] p-3">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-1/2 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-1/3 rounded bg-slate-200" />
        </div>
        <div className="h-6 w-16 shrink-0 rounded-full bg-slate-200" />
      </div>
      <div className="mt-3 h-7 w-20 rounded-lg bg-slate-200" />
    </div>
  );
}

export function SuggestedInstructors({
  schoolId,
  basePath = "/onboarding",
  useMock = false,
}: SuggestedInstructorsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const suburbParam = searchParams.get("suburb") ?? "";
  const postcodeParam = searchParams.get("postcode")?.trim() ?? "";
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

  const activeFilterCount = [
    preferredDateParam,
    lessonTimeParam,
    lessonDurationParam,
    transmissionParam,
  ].filter(Boolean).length;

  const selectedDateLabel = preferredDateParam
    ? (resolveRescheduleDateFromIso(preferredDateParam)?.label ??
      preferredDateParam)
    : null;

  const currentFilters: InstructorFiltersDraft = {
    transmission: transmissionParam ?? null,
    preferredDate: preferredDateParam,
    lessonTime: lessonTimeParam,
    lessonDuration: lessonDurationParam,
  };

  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("price-asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [listKey, setListKey] = useState(0);

  function applyFilters(filters: InstructorFiltersDraft) {
    const params = new URLSearchParams();

    if (suburbParam.trim()) {
      params.set("suburb", suburbParam.trim());
    }

    if (postcodeParam) {
      params.set("postcode", postcodeParam);
    }

    if (filters.transmission) {
      params.set("transmission", filters.transmission);
    }

    if (filters.preferredDate) {
      params.set("preferredDate", filters.preferredDate);
    }

    if (filters.lessonTime) {
      params.set("lessonTime", filters.lessonTime);
    }

    if (filters.lessonDuration) {
      params.set("lessonDuration", filters.lessonDuration);
    }

    const packageId = searchParams.get("packageId");
    if (packageId) {
      params.set("packageId", packageId);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setShowFilters(false);
  }

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
        if (useMock) {
          const mockInstructors = getInstructorsForSuburb(normalizedQuery).map(
            toPublicInstructor,
          );

          // Keep mock searches feeling smooth instead of instant flicker.
          await new Promise((resolve) => {
            window.setTimeout(resolve, 280);
          });

          if (isMounted) {
            setInstructors(mockInstructors);
            setListKey((current) => current + 1);
          }

          return;
        }

        if (!schoolId) {
          if (isMounted) {
            setInstructors([]);
            setListKey((current) => current + 1);
          }

          return;
        }

        const data = await searchPublicInstructors(
          schoolId,
          normalizedQuery,
          transmissionParam,
          preferredDateParam ?? undefined,
        );

        if (isMounted) {
          setInstructors(Array.isArray(data) ? data : []);
          setListKey((current) => current + 1);
        }
      } catch {
        if (isMounted) {
          setInstructors([]);
          setListKey((current) => current + 1);
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
  }, [
    schoolId,
    suburbParam,
    transmissionParam,
    preferredDateParam,
    useMock,
  ]);

  const sortedInstructors = useMemo(() => {
    const next = [...instructors];

    next.sort((a, b) => {
      if (sortOption === "rating-desc") {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }

      const priceA = getInstructorSortPrice(a);
      const priceB = getInstructorSortPrice(b);

      return sortOption === "price-desc" ? priceB - priceA : priceA - priceB;
    });

    return next;
  }, [instructors, sortOption]);

  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortOption)?.label ??
    "Price: Low to High";

  const showSkeletons = loading && instructors.length === 0;
  const showResults = sortedInstructors.length > 0;

  return (
    <div className="instructor-page-enter flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-4 pt-4">
        <section className="shrink-0 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowSortMenu(false);
                setShowFilters(true);
              }}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#f9f9f9] px-3.5 text-sm font-semibold text-slate-900"
            >
              <FiltersIcon className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
              Sort
            </span>

            <div className="relative min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setShowSortMenu((open) => !open)}
                className="flex h-11 w-full items-center justify-between gap-2 rounded-lg bg-[#f9f9f9] px-3.5 text-left text-sm font-semibold leading-tight text-slate-900"
              >
                <span className="min-w-0">{selectedSortLabel}</span>
                <ChevronDownIcon
                  className={`h-4 w-4 shrink-0 transition ${
                    showSortMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showSortMenu ? (
                <div className="absolute right-0 z-20 mt-2 w-full min-w-[12rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  {SORT_OPTIONS.map((option) => {
                    const isSelected = option.value === sortOption;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortOption(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`block w-full px-3.5 py-2.5 text-left text-sm transition ${
                          isSelected
                            ? "bg-[#f9f9f9] font-semibold text-slate-900"
                            : "text-slate-700 hover:bg-[#f9f9f9]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <p className="mt-4 text-xs text-[#4b5563] transition-opacity duration-300">
            {loading && !showResults
              ? "Searching..."
              : `${sortedInstructors.length} instructor${
                  sortedInstructors.length === 1 ? "" : "s"
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
          <div
            className={`instructor-list-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain scroll-smooth pb-4 pt-1 transition-opacity duration-300 [-webkit-overflow-scrolling:touch] ${
              loading && showResults ? "opacity-55" : "opacity-100"
            }`}
          >
            {showSkeletons ? (
              <>
                <InstructorCardSkeleton />
                <InstructorCardSkeleton />
                <InstructorCardSkeleton />
              </>
            ) : showResults ? (
              sortedInstructors.map((instructor, index) => (
                <div
                  key={`${listKey}-${instructor.id}`}
                  className="instructor-card-enter"
                  style={{ "--card-index": index } as CSSProperties}
                >
                  <SuggestedInstructorCard
                    instructor={instructor}
                    basePath={basePath}
                    queryString={searchParams}
                    searchedSuburb={suburbParam.trim()}
                    searchedPostcode={postcodeParam}
                    isBestMatch={(instructor.availableSlots?.length ?? 0) > 0}
                  />
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400 transition-opacity duration-300">
                No instructors found
                {suburbParam.trim() ? ` for ${suburbParam.trim()}` : ""}
              </p>
            )}
          </div>
        </section>
      </main>

      {showFilters ? (
        <InstructorFiltersSheet
          initialFilters={currentFilters}
          onApply={applyFilters}
          onClose={() => setShowFilters(false)}
        />
      ) : null}
    </div>
  );
}
