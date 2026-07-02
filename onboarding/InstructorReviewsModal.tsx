"use client";

import { useEffect } from "react";
import type { InstructorReview } from "./instructor-reviews";
import type { SuggestedInstructor } from "./suggested-instructors";

type InstructorReviewsModalProps = Readonly<{
  instructor: SuggestedInstructor;
  reviews: InstructorReview[];
  onClose: () => void;
}>;

export function ReviewStars({ rating }: Readonly<{ rating: number }>) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm leading-none ${star <= rating ? "text-amber-400" : "text-slate-200"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function InstructorReviewsModal({
  instructor,
  reviews,
  onClose,
}: InstructorReviewsModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close reviews"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reviews-modal-title"
        className="relative z-10 flex h-[85vh] max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="reviews-modal-title" className="text-lg font-bold text-slate-900">
              Reviews
            </h2>
            <p className="mt-0.5 text-sm text-amber-600">
              ★ {instructor.rating.toFixed(1)} · {instructor.reviewCount} reviews
            </p>
          </div>
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-6">
          <div>
            {reviews.map((review) => (
              <article key={review.id} className="border-b border-slate-100 py-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{review.author}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{review.date}</p>
                  </div>
                  <ReviewStars rating={review.rating} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
