"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { InstructorOption } from "../mock-data";
import { InstructorProfileSummary } from "./InstructorSearch";
import { useIsClient } from "@/shared/hooks/useIsClient";

type InstructorReviewModalProps = Readonly<{
  instructor: InstructorOption;
  lessonLabel: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}>;

const ratingLabels = ["Poor", "Fair", "Good", "Very good", "Excellent"];

function StarRating({
  value,
  onChange,
}: Readonly<{
  value: number;
  onChange: (rating: number) => void;
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
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="rounded-lg p-1 transition hover:scale-110"
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
      <p className="h-4 text-sm font-medium text-slate-500">
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const scroller = document.querySelector<HTMLElement>(
      "[data-dashboard-scroll]",
    );
    const previousOverflow = scroller?.style.overflow ?? "";

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    if (scroller) scroller.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (scroller) scroller.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function handleSubmit() {
    if (rating === 0 || isSubmitted) return;
    setIsSubmitted(true);
    onSubmit(rating, comment.trim());
  }

  if (!isClient) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Close review"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        role="dialog"
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
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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

            <div className="rounded-2xl bg-slate-50 p-4">
              <InstructorProfileSummary instructor={instructor} />
              <p className="mt-3 text-xs text-slate-500">{lessonLabel}</p>
            </div>

            <div className="mt-6">
              <p className="text-center text-sm font-medium text-slate-700">
                How was your lesson?
              </p>
              <div className="mt-3">
                <StarRating value={rating} onChange={setRating} />
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
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Submit review
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
