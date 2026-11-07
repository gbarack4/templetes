"use client";

import { useEffect, useState } from "react";

import type { PublicPackage } from "@/lib/public-booking-api";

import { formatLessonHoursLabel } from "../mock-data";
import { ChevronDownIcon, CloseIcon } from "./icons";

type PackagePickerModalProps = Readonly<{
  title?: string;
  packages: PublicPackage[];
  selectedPackageId: string | null;
  onSelectPackage: (packageId: string) => void;
  onClose: () => void;
}>;

function formatPackagePrice(price: string): string {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return `$${price}`;
  }

  return `$${amount.toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function RadioMark({ selected }: Readonly<{ selected: boolean }>) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
      }`}
    >
      {selected ? (
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      ) : null}
    </span>
  );
}

const INITIAL_VISIBLE = 6;

export function PackagePickerModal({
  title = "Choose a lesson package",
  packages,
  selectedPackageId,
  onSelectPackage,
  onClose,
}: PackagePickerModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [draftId, setDraftId] = useState(selectedPackageId);
  const [showAll, setShowAll] = useState(() => {
    if (!selectedPackageId) return false;

    return (
      packages.findIndex((pkg) => pkg.id === selectedPackageId) >=
      INITIAL_VISIBLE
    );
  });
  const selectedPackage =
    packages.find((pkg) => pkg.id === draftId) ?? null;
  const hasMore = packages.length > INITIAL_VISIBLE;
  const visiblePackages = showAll
    ? packages
    : packages.slice(0, INITIAL_VISIBLE);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const frameId = window.requestAnimationFrame(() => setIsVisible(true));

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close package picker"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <dialog
        open
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[80dvh] w-full max-w-md flex-col rounded-t-[1.75rem] bg-white px-5 pb-5 pt-3 shadow-xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-200" />

        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Choose a lesson package
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Select one to continue
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="space-y-1.5">
            {visiblePackages.map((pkg) => {
              const hours = pkg.durationMinutes / 60;
              const isSelected = draftId === pkg.id;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setDraftId(pkg.id)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                    isSelected
                      ? "bg-blue-50"
                      : "bg-white ring-1 ring-slate-200"
                  }`}
                >
                  <RadioMark selected={isSelected} />

                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold leading-tight text-slate-900">
                      {pkg.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {formatLessonHoursLabel(hours)}
                    </span>
                  </span>

                  <span className="shrink-0 text-[13px] font-semibold text-slate-900">
                    {formatPackagePrice(pkg.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {hasMore ? (
          <button
            type="button"
            onClick={() => setShowAll((open) => !open)}
            className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-slate-400 transition hover:text-slate-600"
          >
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition ${showAll ? "rotate-180" : ""}`}
            />
            {showAll ? "Show less" : "More options available"}
          </button>
        ) : null}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Selected:</p>
              <p className="truncate text-sm font-bold text-slate-900">
                {selectedPackage?.name ?? "None"}
              </p>
            </div>

            <p className="shrink-0 text-base font-bold text-slate-900">
              {selectedPackage
                ? formatPackagePrice(selectedPackage.price)
                : ""}
            </p>
          </div>

          <button
            type="button"
            disabled={!draftId}
            onClick={() => {
              if (!draftId) return;
              onSelectPackage(draftId);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Continue
            <span aria-hidden className="text-white">
              →
            </span>
          </button>
        </div>
      </dialog>
    </div>
  );
}
