"use client";

import { useEffect, useMemo, useState } from "react";

import { CloseIcon } from "@/dashboard/components/icons";

import type { InstructorReview } from "./instructor-reviews";
import type { SuggestedInstructor } from "./suggested-instructors";

type InstructorReviewsModalProps = Readonly<{
  instructor: SuggestedInstructor;
  reviews: InstructorReview[];
  onClose: () => void;
}>;

export function ReviewStars({
  rating,
  size = "sm",
}: Readonly<{ rating: number; size?: "sm" | "md" | "lg" }>) {
  const sizeClass =
    size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm";

  return (
    <div
      className={`flex gap-0.5 ${sizeClass} leading-none`}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-amber-400" : "text-slate-200"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function authorInitials(author: string): string {
  const parts = author.replace(/\./g, "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function buildRatingBreakdown(reviews: readonly InstructorReview[]) {
  const counts = [0, 0, 0, 0, 0];

  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(review.rating)));
    counts[star - 1] += 1;
  }

  const total = reviews.length || 1;

  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: counts[star - 1] ?? 0,
    percent: ((counts[star - 1] ?? 0) / total) * 100,
  }));
}

export function InstructorReviewsModal({
  instructor,
  reviews,
  onClose,
}: InstructorReviewsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const rating = instructor.rating ?? 0;
  const reviewCount = instructor.reviewCount ?? reviews.length;
  const breakdown = useMemo(() => buildRatingBreakdown(reviews), [reviews]);

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
        aria-label="Close reviews"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reviews-modal-title"
        className={`relative z-10 flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-[1.75rem] bg-white shadow-xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-slate-200" />

        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-4">
          <div>
            <h2
              id="reviews-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              Reviews
            </h2>
            <p className="mt-0.5 text-sm text-[#4b5563]">
              What students say about {instructor.name.split(" ")[0]}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f9f9f9] text-slate-600 transition hover:bg-slate-200"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-6">
          <section className="rounded-xl bg-[#f9f9f9] p-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold tracking-tight text-slate-900">
                  {rating.toFixed(1)}
                </p>
                <div className="mt-1 flex justify-center">
                  <ReviewStars rating={Math.round(rating)} size="md" />
                </div>
                <p className="mt-1 text-xs font-medium text-[#4b5563]">
                  {reviewCount} review{reviewCount === 1 ? "" : "s"}
                </p>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                {breakdown.map((row) => (
                  <div key={row.star} className="flex items-center gap-2">
                    <span className="w-3 text-right text-[11px] font-semibold text-slate-500">
                      {row.star}
                    </span>
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-4 space-y-3">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl bg-[#f9f9f9] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600">
                      {authorInitials(review.author)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {review.author}
                          </p>
                          <p className="mt-0.5 text-xs text-[#4b5563]">
                            {review.date}
                          </p>
                        </div>
                        <ReviewStars rating={review.rating} />
                      </div>

                      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-[#4b5563]">
                No reviews yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
