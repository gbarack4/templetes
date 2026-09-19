"use client";

import { useEffect, useState } from "react";

import {
  GoogleAddressAutocomplete,
  type AddressSelectionDetails,
} from "@/components/GoogleAddressAutocomplete";

type AddressPickerModalProps = Readonly<{
  title?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string, details: AddressSelectionDetails) => void;
  onConfirm?: () => void;
  onClose: () => void;
  canConfirm?: boolean;
}>;

export function AddressPickerModal({
  title = "Pick up address",
  value,
  onChange,
  onSelect,
  onConfirm,
  onClose,
  canConfirm = false,
}: AddressPickerModalProps) {
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
        aria-label="Close address picker"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <dialog
        open
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex h-[78dvh] max-h-[78dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[1.75rem] bg-white px-5 pb-6 pt-3 shadow-xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-slate-200" />

        <h2 className="mb-5 shrink-0 text-center text-lg font-bold text-slate-900">
          {title}
        </h2>

        <GoogleAddressAutocomplete
          id="pickup-address"
          value={value}
          suggestionLayout="sheet"
          className="relative min-h-0 flex-1"
          onChange={onChange}
          onSelect={(nextValue, details) => {
            onSelect?.(nextValue, details);
            onClose();
          }}
          placeholder="Enter pick up address"
          inputClassName="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {canConfirm ? (
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="mt-4 shrink-0 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Use this address
          </button>
        ) : null}
      </dialog>
    </div>
  );
}
