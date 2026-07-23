"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarPickerModal } from "@/dashboard/components/CalendarPickerModal";
import { getSelectedRescheduleDate } from "@/dashboard/components/RescheduleCalendar";
import { buildFutureDates } from "@/dashboard/mock-data";
import {
  buildOnboardingSearchPath,
  getOnboardingBasePath,
} from "@/onboarding/paths";
import { DrivingSchoolProfile } from "@/login/DrivingSchoolProfile";
import {
  formatReviewCount,
  resolveGoogleReviews,
  resolveSchoolProfile,
} from "@/login/school-profile";
import { useSchool } from "@/dashboard/SchoolContext";
import { GoogleAddressAutocomplete } from "@/components/GoogleAddressAutocomplete";
import type { TemplateProps } from "./types";

function SearchIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const fieldClassName =
  "w-full rounded-2xl border border-transparent bg-slate-100 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

const SEARCH_LOADING_MS = 2000;

export function ClassicTemplate({ data }: Readonly<TemplateProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const [suburb, setSuburb] = useState("");
  const [transmission, setTransmission] = useState("Auto");
  const [testDateId, setTestDateId] = useState<string | null>(null);
  const [showTestDatePicker, setShowTestDatePicker] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const futureDates = useMemo(() => buildFutureDates(), []);
  const selectedTestDate = getSelectedRescheduleDate(futureDates, testDateId);
  const { schoolName, logoUrl } = useSchool();
  const school = resolveSchoolProfile(
    data,
    { schoolName, logoUrl },
    { fallbackToMock: true },
  );
  const googleReviews = resolveGoogleReviews(data);
  const canSearch = suburb.trim().length > 0;

  function handleSearch(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSearch || isSearching) return;

    const testDate = selectedTestDate
      ? `${selectedTestDate.year}-${String(selectedTestDate.monthIndex + 1).padStart(2, "0")}-${String(selectedTestDate.day).padStart(2, "0")}`
      : undefined;

    setIsSearching(true);
    window.setTimeout(() => {
      router.push(
        buildOnboardingSearchPath(getOnboardingBasePath(pathname), {
          suburb,
          transmission,
          testDate,
        }),
      );
    }, SEARCH_LOADING_MS);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
      <header className="flex shrink-0 items-center justify-between px-5 pb-2 pt-5">
        <DrivingSchoolProfile
          school={school}
          className="bg-transparent px-0 py-0"
        />
        <Link
          href="/login"
          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          Sign in
        </Link>
      </header>

      <main className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-4">
        <h3 className="text-center text-2xl font-bold leading-tight text-slate-900">
          Book driving lessons with local{" "}
          <span className="mt-1 block">instructors</span>
        </h3>

        <div className="mt-3 flex items-center justify-center gap-2">
          <GoogleIcon />
          <div className="flex items-center gap-0.5 text-amber-400" aria-hidden>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-sm leading-none">
                ★
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              {googleReviews.rating}
            </span>{" "}
            ({formatReviewCount(googleReviews.reviewCount)} reviews)
          </p>
        </div>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <SearchIcon className="h-5 w-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              Find an instructor
            </h2>
          </div>

          <form className="mt-5 space-y-5" onSubmit={handleSearch}>
            <div className="space-y-2">
              <label
                htmlFor="pickup-address"
                className="text-sm font-semibold text-slate-900"
              >
                Pick-up Location <span className="text-orange-500">*</span>
              </label>
              <GoogleAddressAutocomplete
                id="pickup-address"
                value={suburb}
                onChange={setSuburb}
                onSelect={setSuburb}
                placeholder="Enter pick up address"
                inputClassName={`${fieldClassName} py-3.5 pl-11 pr-4 placeholder:text-slate-400`}
                icon={
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="transmission"
                className="text-sm font-semibold text-slate-900"
              >
                Transmission <span className="text-orange-500">*</span>
              </label>
              <select
                id="transmission"
                value={transmission}
                onChange={(event) => setTransmission(event.target.value)}
                className={`${fieldClassName} appearance-none px-4 py-3.5`}
              >
                <option value="Auto">Auto</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="space-y-2">
              <div>
                <label
                  htmlFor="test-date"
                  className="text-sm font-semibold text-slate-900"
                >
                  Pick date
                </label>
                <p className="text-xs text-slate-400">
                  Optional, helps match availability
                </p>
              </div>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  id="test-date"
                  onClick={() => setShowTestDatePicker(true)}
                  className={`${fieldClassName} py-3.5 pl-11 pr-4 text-left`}
                >
                  <span
                    className={
                      selectedTestDate ? "text-slate-900" : "text-slate-400"
                    }
                  >
                    {selectedTestDate?.label ?? "Select test date"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              aria-busy={isSearching}
              disabled={!canSearch}
              className={`w-full rounded-full bg-slate-900 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 ${
                isSearching ? "pointer-events-none" : ""
              }`}
            >
              {isSearching ? "Searching...." : "Search Instructors"}
            </button>
          </form>
        </section>

        <p className="mt-auto pt-6 text-center text-xs leading-relaxed text-slate-500">
          By booking with{" "}
          <span className="font-medium text-slate-700">{school.name}</span>, you
          agree to our{" "}
          <Link
            href="#"
            className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            terms
          </Link>
          .
        </p>
      </main>

      {showTestDatePicker && (
        <CalendarPickerModal
          title="Choose date"
          availableDates={futureDates}
          selectedDateId={testDateId}
          onSelectDate={setTestDateId}
          onClose={() => setShowTestDatePicker(false)}
        />
      )}
    </div>
  );
}
