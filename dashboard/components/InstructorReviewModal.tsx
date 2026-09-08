"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ButtonSpinner } from "@/components/ButtonSpinner";
import { useIsClient } from "@/shared/hooks/useIsClient";
import type { InstructorOption } from "@/types/instructor";

import { InstructorProfileSummary } from "./InstructorSearch";

type InstructorReviewModalProps = Readonly<{
  instructor: InstructorOption;
  lessonLabel: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}>;

const ratingLabels = ["Poor", "Fair", "Good", "Very good", "Excellent"];

function StarRating({
  value,
  onChange,
  disabled = false,
}: Readonly<{
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}>) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} out of 5 stars`}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => {
              if (!disabled) {
                setHovered(star);
              }
            }}
            onMouseLeave={() => setHovered(0)}
            className="rounded-lg p-1 transition hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span
              className={`text-3xl leading-none ${
                star <= active ? "text-amber-400" : "text-slate-200"
              }`}
            >
              ★
            </span>
          </button>
        ))}
      </div>

      <p className="h-4 text-sm font-medium text-[#4b5563]">
        {active > 0 ? ratingLabels[active - 1] : "Tap to rate"}
      </p>
    </div>
  );
}

export function InstructorReviewModal({
  instructor,
  lessonLabel,
  onClose,
  onSubmit,
}: InstructorReviewModalProps) {
  const isClient = useIsClient();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    const scroller = document.querySelector<HTMLElement>(
      "[data-dashboard-scroll]",
    );

    const previousBodyOverflow = document.body.style.overflow;
    const previousScrollerOverflow = scroller?.style.overflow ?? "";

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    if (scroller) {
      scroller.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousBodyOverflow;

      if (scroller) {
        scroller.style.overflow = previousScrollerOverflow;
      }
    };
  }, [isSubmitting, onClose]);

  async function handleSubmit() {
    if (rating === 0 || isSubmitting || isSubmitted) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(rating, comment.trim());

      setIsSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit review. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  if (!isClient) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Close review"
        disabled={isSubmitting}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/40 disabled:cursor-wait"
      />

      <dialog
        open
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl bg-white px-5 pb-8 pt-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {isSubmitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
              ✓
            </div>

            <h2
              id="review-modal-title"
              className="mt-6 text-xl font-bold text-slate-900"
            >
              Review submitted
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Thanks for sharing feedback on your lesson with {instructor.name}.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="review-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                Leave a review
              </h2>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Close"
                className="rounded-lg p-1.5 text-[#4b5563] transition hover:bg-[#f9f9f9] hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="rounded-2xl bg-[#f9f9f9] p-4">
              <InstructorProfileSummary instructor={instructor} />

              <p className="mt-3 text-xs text-[#4b5563]">{lessonLabel}</p>
            </div>

            <div className="mt-6">
              <p className="text-center text-sm font-medium text-slate-700">
                How was your lesson?
              </p>

              <div className="mt-3">
                <StarRating
                  value={rating}
                  onChange={setRating}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="review-comment"
                className="text-sm font-medium text-slate-700"
              >
                Add a comment{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share your experience with this instructor..."
                rows={3}
                maxLength={2000}
                disabled={isSubmitting}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              aria-busy={isSubmitting}
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-[#f9f9f9] disabled:text-[#4b5563]"
            >
              {isSubmitting ? (
                <>
                  <ButtonSpinner inverse />
                  Submitting...
                </>
              ) : (
                "Submit review"
              )}
            </button>
          </>
        )}
      </dialog>
    </div>,
    document.body,
  );
}
