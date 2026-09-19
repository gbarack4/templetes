"use client";

import { useEffect, useState } from "react";

import type { PublicPackage } from "@/lib/public-booking-api";

import { formatLessonHoursLabel } from "../mock-data";

type PackagePickerModalProps = Readonly<{
  title?: string;
  packages: PublicPackage[];
  selectedPackageId: string | null;
  onSelectPackage: (packageId: string) => void;
  onClose: () => void;
}>;

export function PackagePickerModal({
  title = "Select lesson package",
  packages,
  selectedPackageId,
  onSelectPackage,
  onClose,
}: PackagePickerModalProps) {
  const [isVisible, setIsVisible] = useState(false);

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
        className={`relative z-10 flex max-h-[70dvh] w-full max-w-md flex-col rounded-t-[1.75rem] bg-white px-5 pb-6 pt-3 shadow-xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-slate-200" />

        <h2 className="mb-5 shrink-0 text-center text-lg font-bold text-slate-900">
          {title}
        </h2>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="flex flex-col">
            {packages.map((pkg) => {
              const hours = pkg.durationMinutes / 60;
              const isSelected = selectedPackageId === pkg.id;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => {
                    onSelectPackage(pkg.id);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-100 py-3.5 text-left last:border-b-0 transition hover:opacity-80"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">
                      {pkg.name}
                    </span>

                    <span className="mt-0.5 block text-xs text-slate-500">
                      {formatLessonHoursLabel(hours)} · $
                      {Number(pkg.price).toFixed(2)}
                    </span>
                  </span>

                  {isSelected ? (
                    <span className="text-sm font-semibold text-blue-600">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </dialog>
    </div>
  );
}
