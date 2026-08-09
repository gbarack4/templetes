"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import { FlowPageHeader } from "@/dashboard/components/FlowPageHeader";
import { ChevronRightIcon, PhoneIcon } from "@/dashboard/components/icons";
import { formatCurrency } from "@/dashboard/mock-data";
import { getInstructorReviews } from "./instructor-reviews";
import { InstructorReviewsModal, ReviewStars } from "./InstructorReviewsModal";
import { withOnboardingQuery } from "./paths";
import {
  instructorProfileDetails,
  type SuggestedInstructor,
} from "./suggested-instructors";

type InstructorProfileProps = Readonly<{
  instructor: SuggestedInstructor;
  basePath?: string;
  bookHref?: string;
}>;

const BUTTON_LOADING_MS = 2000;

export function InstructorProfile({
  instructor,
  basePath = "/preview/onboarding",
  bookHref,
}: InstructorProfileProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showReviews, setShowReviews] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const details = instructorProfileDetails[instructor.id];
  const reviews = getInstructorReviews(instructor.id);
  const showImage = Boolean(instructor.avatarUrl) && !imageError;
  const isOnboarding = !bookHref;

  function handleBookLesson() {
    if (isBooking) return;
    setIsBooking(true);
    const destination =
      bookHref ??
      withOnboardingQuery(`${basePath}/book/${instructor.id}`, searchParams);
    window.setTimeout(() => {
      router.push(destination);
    }, BUTTON_LOADING_MS);
  }

  return (
    <>
      <FlowPageHeader title="Instructor profile" onBack={() => router.back()} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-4 pt-6 [-webkit-overflow-scrolling:touch]">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center">
              <div className="relative flex items-center">
                <div className="relative z-0 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-200 text-2xl font-semibold text-slate-600 ring-4 ring-white">
                  {showImage ? (
                    <Image
                      src={instructor.avatarUrl}
                      alt={`${instructor.name}'s profile`}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                      sizes="80px"
                    />
                  ) : (
                    instructor.initials
                  )}
                </div>
                {details?.car && (
                  <div className="relative z-10 -ml-5 h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 ring-4 ring-white shadow-sm">
                    <Image
                      src={details.car.imageUrl}
                      alt={`${details.car.year} ${details.car.make} ${details.car.model}`}
                      fill
                      className={
                        details.car.imageUrl.endsWith(".svg")
                          ? "scale-125 object-contain p-0.5"
                          : "object-cover"
                      }
                      sizes="80px"
                    />
                  </div>
                )}
              </div>
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              {instructor.name}
            </h1>
            <button
              type="button"
              onClick={() => setShowReviews(true)}
              className="mt-1 text-sm font-medium text-amber-600 transition hover:text-amber-700"
            >
              ★ {instructor.rating.toFixed(1)} · {instructor.reviewCount} reviews
            </button>
            <p className="mt-1 text-sm text-slate-500">
              {instructor.lessonsCompleted.toLocaleString()} lessons completed
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Rate
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {formatCurrency(instructor.pricePerHour)}/hr
              </p>
            </div>
            {!isOnboarding && details?.phone && (
              <a
                href={`tel:${details.phone}`}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                <PhoneIcon className="h-4 w-4" />
                Call
              </a>
            )}
          </div>

          {details && (
            <>
              <section className="mt-6">
                <h2 className="text-sm font-semibold text-slate-900">
                  Lesson car
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Make & model
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {details.car.year} {details.car.make} {details.car.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Color
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {details.car.color}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Transmission
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {details.car.transmission}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Fuel
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {details.car.fuel}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-6">
                <button
                  type="button"
                  aria-expanded={aboutOpen}
                  onClick={() => setAboutOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3.5 text-left transition hover:bg-slate-100"
                >
                  <h2 className="text-sm font-semibold text-slate-900">About</h2>
                  <ChevronRightIcon
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      aboutOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {aboutOpen ? (
                  <p className="mt-2 px-1 text-sm leading-relaxed text-slate-600">
                    {details.bio}
                  </p>
                ) : null}
              </section>
            </>
          )}

          {reviews.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-slate-900">Reviews</h2>
              <div className="mt-3">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="border-b border-slate-100 py-4 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {review.author}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {review.date}
                        </p>
                      </div>
                      <ReviewStars rating={review.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {review.comment}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">
          <button
            type="button"
            aria-busy={isBooking}
            onClick={handleBookLesson}
            className={`inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 ${
              isBooking ? "pointer-events-none" : ""
            }`}
          >
            {isBooking ? <ButtonSpinner inverse /> : "Book lesson"}
          </button>
        </div>
      </main>

      {showReviews && (
        <InstructorReviewsModal
          instructor={instructor}
          reviews={reviews}
          onClose={() => setShowReviews(false)}
        />
      )}
    </>
  );
}
