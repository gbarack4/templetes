"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarPickerModal } from "@/dashboard/components/CalendarPickerModal";
import { getSelectedRescheduleDate } from "@/dashboard/components/RescheduleCalendar";
import { buildOnboardingSearchPath, getOnboardingBasePath } from "@/onboarding/paths";
import { resolveAvailableDates, resolveModernSite } from "@/templates/resolve-modern-site";
import { useSchool } from "@/dashboard/SchoolContext";
import { SuburbAutocomplete } from "./SuburbAutocomplete";
import type { TemplateProps } from "./types";

type IconProps = Readonly<{ className?: string; style?: React.CSSProperties }>;

function ChevronRightIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CalendarIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 5-6 8-6s6.5 2.5 8 6" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 3z" strokeLinejoin="round" />
    </svg>
  );
}

function ClockBadgeIcon({ className }: Readonly<{ className?: string }>) {
  return <ClockIcon className={className} />;
}

function LockIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

const trustBadgeIcons = [ShieldIcon, StarIcon, ClockBadgeIcon, LockIcon] as const;

const fieldClassName =
  "flex w-full items-center gap-3 rounded-2xl border border-transparent bg-slate-100 px-4 py-3.5 text-left text-sm transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100";

export function ModernTemplate({ data }: Readonly<TemplateProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const { schoolName, logoUrl } = useSchool();
  const site = useMemo(
    () =>
      resolveModernSite(data, { schoolName, logoUrl }, { fallbackToMock: true }),
    [data, schoolName, logoUrl],
  );
  const availableDates = useMemo(
    () => resolveAvailableDates(data, site.availableDates),
    [data, site.availableDates],
  );

  const [suburb, setSuburb] = useState("");
  const [transmission, setTransmission] = useState(site.transmissionOptions[0] ?? "Auto");
  const [lessonDateId, setLessonDateId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [lessonDuration, setLessonDuration] = useState(site.lessonDurations[0] ?? "1 Hour");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const selectedDate = getSelectedRescheduleDate(availableDates, lessonDateId);
  const canSearch = suburb.trim().length > 0 && selectedDate && selectedTime;
  const brandColorStyle = { color: site.primaryColor };
  const brandBgStyle = { backgroundColor: site.primaryColor };

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSearch || !selectedDate || !selectedTime) return;

    const lessonDate = `${selectedDate.year}-${String(selectedDate.monthIndex + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;

    router.push(
      buildOnboardingSearchPath(getOnboardingBasePath(pathname), {
        suburb,
        transmission,
        testDate: lessonDate,
        lessonTime: selectedTime,
        lessonDuration,
      }),
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white">
      <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {site.school.logoUrl ? (
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-blue-50 ring-1 ring-blue-100">
                <Image
                  src={site.school.logoUrl}
                  alt={`${site.school.name} logo`}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                  unoptimized={/^https?:\/\//i.test(site.school.logoUrl)}
                />
              </div>
            ) : null}
            {site.school.name ? (
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900">
                  {site.brandName}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {site.phoneNumber ? (
              <a
                href={`tel:${site.phoneNumber}`}
                aria-label="Call us"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-slate-100 transition hover:bg-slate-200"
                style={brandColorStyle}
              >
                <PhoneIcon className="h-4 w-4" />
              </a>
            ) : (
              <button
                type="button"
                aria-label="Call us"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-slate-100 transition hover:bg-slate-200"
                style={brandColorStyle}
              >
                <PhoneIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <nav className="mt-4 hidden gap-5 text-sm font-medium text-slate-500 sm:flex">
          {site.navLinks.map((item) => (
            <a key={item.label} href={item.href} className="transition hover:text-slate-900">
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="flex-1 bg-white px-5 pb-8 pt-6">
        <section className="overflow-hidden rounded-3xl bg-white">
          <form className="p-5" onSubmit={handleSearch}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="pickup-location" className="text-sm font-semibold text-slate-900">
                  Pick-up Location <span className="text-red-500">*</span>
                </label>
                <SuburbAutocomplete
                  id="pickup-location"
                  value={suburb}
                  onChange={setSuburb}
                  placeholder="Enter your suburb or address"
                  className={`${fieldClassName} relative`}
                  inputClassName="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  icon={
                    <PinIcon className="h-5 w-5 shrink-0" style={brandColorStyle} />
                  }
                  trailing={
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
                  }
                />
                <p className="text-xs text-slate-400">{site.pickupHint}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">
                  Transmission <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {site.transmissionOptions.map((option) => {
                    const isSelected = transmission === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTransmission(option)}
                        className={`rounded-xl border border-transparent px-3 py-2.5 text-xs font-semibold transition ${
                          isSelected
                            ? "text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                        }`}
                        style={isSelected ? brandBgStyle : undefined}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="lesson-date" className="text-sm font-semibold text-slate-900">
                  Pick a Date <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  id="lesson-date"
                  onClick={() => setShowDatePicker(true)}
                  className={fieldClassName}
                >
                  <CalendarIcon className="h-5 w-5 shrink-0" style={brandColorStyle} />
                  <span className={`flex-1 ${selectedDate ? "text-slate-900" : "text-slate-400"}`}>
                    {selectedDate?.label ?? "Select a date"}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="lesson-time" className="text-sm font-semibold text-slate-900">
                  Pick a Time <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  id="lesson-time"
                  onClick={() => setShowTimePicker(true)}
                  className={fieldClassName}
                >
                  <ClockIcon className="h-5 w-5 shrink-0" style={brandColorStyle} />
                  <span className={`flex-1 ${selectedTime ? "text-slate-900" : "text-slate-400"}`}>
                    {selectedTime ?? "Select a time"}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="lesson-duration" className="text-sm font-semibold text-slate-900">
                  Lesson Duration
                </label>
                <div className={fieldClassName}>
                  <ClockIcon className="h-5 w-5 shrink-0" style={brandColorStyle} />
                  <select
                    id="lesson-duration"
                    value={lessonDuration}
                    onChange={(event) => setLessonDuration(event.target.value)}
                    className="min-w-0 flex-1 appearance-none bg-transparent text-slate-900 outline-none"
                  >
                    {site.lessonDurations.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-300" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSearch}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              style={canSearch ? brandBgStyle : undefined}
            >
              <SearchIcon className="h-5 w-5" />
              Search Instructors
            </button>
          </form>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <UserIcon className="h-4 w-4 shrink-0" style={brandColorStyle} />
              <span>You already have an account?</span>
            </div>
            <Link
              href={site.loginPath}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              style={brandBgStyle}
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="mt-6 flex divide-x divide-slate-100 border-t border-slate-100 pt-4">
          {site.trustBadges.map((label, index) => {
            const Icon = trustBadgeIcons[index] ?? ShieldIcon;

            return (
            <div key={label} className="flex min-w-0 flex-1 items-center gap-1 px-1.5 first:pl-0 last:pr-0">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Icon className="h-2.5 w-2.5" />
              </div>
              <p className="text-[8px] font-medium leading-tight text-slate-900">{label}</p>
            </div>
            );
          })}
        </section>
      </main>

      {showDatePicker && (
        <CalendarPickerModal
          title="Pick a date"
          availableDates={availableDates}
          selectedDateId={lessonDateId}
          onSelectDate={setLessonDateId}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {showTimePicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Close time picker"
            onClick={() => setShowTimePicker(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Pick a time</h2>
              <button
                type="button"
                onClick={() => setShowTimePicker(false)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {site.timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    setSelectedTime(time);
                    setShowTimePicker(false);
                  }}
                  className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                    selectedTime === time
                      ? "text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                  style={selectedTime === time ? brandBgStyle : undefined}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
