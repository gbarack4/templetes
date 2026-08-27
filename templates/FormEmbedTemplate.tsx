"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarPickerModal } from "@/dashboard/components/CalendarPickerModal";
import { getSelectedRescheduleDate } from "@/dashboard/components/RescheduleCalendar";
import { buildFutureDates } from "@/dashboard/mock-data";
import {
  buildOnboardingSearchPath,
  getOnboardingBasePath,
} from "@/onboarding/paths";
import { submitFormEmbedSearch } from "./form-embed-search";
import { mockModernTransmissionOptions } from "./resolve-modern-site";
import { SuburbAutocomplete } from "./SuburbAutocomplete";
import type { TemplateProps } from "./types";
import { GoogleAddressAutocomplete } from "@/components/GoogleAddressAutocomplete";

function ChevronDownIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

const fieldClassName =
  "flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100";

export function FormEmbedTemplate({ data }: Readonly<TemplateProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const transmissionOptions = data.config?.transmissionOptions ?? [
    ...mockModernTransmissionOptions,
  ];

  const [suburb, setSuburb] = useState("");
  const [transmission, setTransmission] = useState(
    transmissionOptions[0] ?? "Auto",
  );
  const [testDateId, setTestDateId] = useState<string | null>(null);
  const [showTestDatePicker, setShowTestDatePicker] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const futureDates = useMemo(() => buildFutureDates(), []);
  const selectedTestDate = getSelectedRescheduleDate(futureDates, testDateId);
  const canSearch = suburb.trim().length > 0;

  async function handleSearch(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSearch || isSearching) return;

    const testDate = selectedTestDate
      ? `${selectedTestDate.year}-${String(selectedTestDate.monthIndex + 1).padStart(2, "0")}-${String(selectedTestDate.day).padStart(2, "0")}`
      : undefined;

    setError(null);
    setIsSearching(true);

    try {
      const result = await submitFormEmbedSearch({
        suburb: suburb.trim(),
        transmission,
        testDate,
      });

      if (!result.success) {
        setError("Something went wrong. Please try again.");
        setIsSearching(false);
        return;
      }

      router.push(
        buildOnboardingSearchPath(getOnboardingBasePath(pathname), {
          suburb,
          transmission,
          preferredDate: testDate,
        }),
      );
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSearching(false);
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <main className="flex-1 px-5 pb-24 pt-6">
        <form className="space-y-5" onSubmit={handleSearch}>
          <div className="space-y-2">
            <label
              htmlFor="embed-pickup"
              className="text-sm font-semibold text-slate-900"
            >
              Pick-up Location <span className="text-amber-500">*</span>
            </label>
            <GoogleAddressAutocomplete
              id="embed-pickup"
              mode="suburb"
              value={suburb}
              onChange={setSuburb}
              onSelect={setSuburb}
              placeholder="Enter suburb or postcode"
              className={`${fieldClassName} relative`}
              inputClassName="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
              trailing={
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-300" />
              }
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="embed-transmission"
              className="text-sm font-semibold text-slate-900"
            >
              Transmission <span className="text-amber-500">*</span>
            </label>
            <div className={fieldClassName}>
              <select
                id="embed-transmission"
                value={transmission}
                onChange={(event) => setTransmission(event.target.value)}
                className="min-w-0 flex-1 appearance-none bg-transparent outline-none"
              >
                {transmissionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-300" />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="embed-test-date"
              className="text-sm font-semibold text-slate-900"
            >
              Pick dates
            </label>
            <div className={fieldClassName}>
              <button
                type="button"
                id="embed-test-date"
                onClick={() => setShowTestDatePicker(true)}
                className={`min-w-0 flex-1 text-left outline-none ${
                  selectedTestDate ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {selectedTestDate?.label ?? "Select date"}
              </button>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-300" />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            aria-busy={isSearching}
            disabled={!canSearch}
            className={`mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
              canSearch
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            } ${isSearching ? "pointer-events-none" : ""}`}
          >
            <SearchIcon className="h-4 w-4" />
            {isSearching ? "Searching...." : "Search instructors"}
          </button>
        </form>
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
