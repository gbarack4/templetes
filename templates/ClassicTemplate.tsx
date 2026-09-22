"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { GoogleAddressAutocomplete } from "@/components/GoogleAddressAutocomplete";
import { CalendarPickerModal } from "@/dashboard/components/CalendarPickerModal";
import { getSelectedRescheduleDate } from "@/dashboard/components/RescheduleCalendar";
import { useSchool } from "@/dashboard/SchoolContext";
import { buildFutureDates } from "@/onboarding/booking-utils";
import { DrivingSchoolProfile } from "@/login/DrivingSchoolProfile";
import {
  formatReviewCount,
  resolveSchoolProfile,
} from "@/login/school-profile";
import {
  buildOnboardingSearchPath,
  getOnboardingBasePath,
} from "@/onboarding/paths";

import type { TemplateProps } from "./types";
import { getCurrentMonth } from "@/shared/utils/get-current-month";

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

const fieldClassName =
  "w-full rounded-2xl border border-transparent bg-[#f9f9f9] text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

export function ClassicTemplate({ data }: Readonly<TemplateProps>) {
  const router = useRouter();
  const pathname = usePathname();

  const [suburb, setSuburb] = useState("");
  const [postcode, setPostcode] = useState("");
  const [transmission, setTransmission] = useState("Auto");
  const [preferredDateId, setPreferredDateId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(getCurrentMonth);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const futureDates = useMemo(() => buildFutureDates(), []);

  const selectedDate = getSelectedRescheduleDate(futureDates, preferredDateId);

  const { schoolName, logoUrl } = useSchool();
  const school = resolveSchoolProfile(data, { schoolName, logoUrl });
  const reviews = {
    rating: data.rating,
    reviewCount: data.reviewCount,
  };

  const canSearch =
    suburb.trim().length > 0 &&
    transmission.length > 0 &&
    selectedDate !== null;

  function handleSearch(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSearch || isSearching || !selectedDate) {
      return;
    }

    const preferredDate = `${selectedDate.year}-${String(
      selectedDate.monthIndex + 1,
    ).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;

    setIsSearching(true);

    router.push(
      buildOnboardingSearchPath(getOnboardingBasePath(pathname), {
        suburb,
        postcode,
        transmission,
        preferredDate,
      }),
    );
  }

  function handleSuburbChange(value: string) {
    setSuburb(value);
    setPostcode("");
  }

  function handleSuburbSelect(
    value: string,
    details: Readonly<{ postcode?: string }>,
  ) {
    setSuburb(value);
    setPostcode(details.postcode ?? "");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f9f9f9]">
      <header className="flex shrink-0 items-center justify-between px-5 pt-5 pb-2">
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

      <main className="flex min-h-0 flex-1 flex-col px-5 pt-4 pb-6">
        <h3 className="text-center text-2xl leading-tight font-bold text-slate-900">
          Book driving lessons with local{" "}
          <span className="mt-1 block">instructors</span>
        </h3>

        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="flex items-center gap-0.5 text-amber-400" aria-hidden>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-sm leading-none">
                ★
              </span>
            ))}
          </div>

          <p className="text-sm text-[#4b5563]">
            <span className="font-semibold text-slate-700">
              {reviews.rating.toFixed(1)}
            </span>{" "}
            ({formatReviewCount(reviews.reviewCount)} reviews)
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
                Suburb or postcode <span className="text-orange-500">*</span>
              </label>
              <GoogleAddressAutocomplete
                id="pickup-address"
                mode="suburb"
                value={suburb}
                onChange={handleSuburbChange}
                onSelect={handleSuburbSelect}
                placeholder="Enter suburb or postcode"
                inputClassName={`${fieldClassName} py-3.5 pr-4 pl-11 placeholder:text-slate-400`}
                icon={
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
              <label
                htmlFor="preferred-date"
                className="text-sm font-semibold text-slate-900"
              >
                Pick date <span className="text-orange-500">*</span>
              </label>

              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <button
                  type="button"
                  id="preferred-date"
                  onClick={() => setShowDatePicker(true)}
                  className={`${fieldClassName} py-3.5 pr-4 pl-11 text-left`}
                >
                  <span
                    className={
                      selectedDate ? "text-slate-900" : "text-[#4b5563]"
                    }
                  >
                    {selectedDate?.label ?? "Select date"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              aria-busy={isSearching}
              disabled={!canSearch || isSearching}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSearching ? "Searching...." : "Search Instructors"}
            </button>
          </form>
        </section>

        <p className="mt-auto pt-6 text-center text-xs leading-relaxed text-[#4b5563]">
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

      {showDatePicker && (
        <CalendarPickerModal
          title="Choose date"
          month={calendarMonth}
          availableDates={futureDates}
          selectedDateId={preferredDateId}
          onMonthChange={(month) => {
            setCalendarMonth(month);
            setPreferredDateId(null);
          }}
          onSelectDate={setPreferredDateId}
          onClose={() => setShowDatePicker(false)}
          showSlotLabels={false}
        />
      )}
    </div>
  );
}
