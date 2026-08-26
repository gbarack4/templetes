"use client";

import { useEffect, useState } from "react";

type TimePickerModalProps = Readonly<{
  title?: string;
  timeSlots: readonly string[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  onClose: () => void;
}>;

export function TimePickerModal({
  title = "Select time",
  timeSlots,
  selectedTime,
  onSelectTime,
  onClose,
}: TimePickerModalProps) {
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
        aria-label="Close time picker"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
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
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;

              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    onSelectTime(time);
                    onClose();
                  }}
                  className={`rounded-xl px-1 py-3 text-center text-xs font-semibold transition ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-[#f9f9f9] text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
