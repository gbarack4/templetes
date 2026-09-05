"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonSpinner } from "@/components/ButtonSpinner";
import { FlowPageHeader } from "@/dashboard/components/FlowPageHeader";
import { ChevronRightIcon, PhoneIcon } from "@/dashboard/components/icons";
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
function HeartIcon({
  className,
  filled = false,
}: Readonly<{ className?: string; filled?: boolean }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 6.9l-1.4-1.3a5.2 5.2 0 0 0-7.4 7.4l1.4 1.3L12 21l7.4-6.7 1.4-1.3a5.2 5.2 0 0 0 0-7.4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CarGlyph({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="#0d5af2"
      aria-hidden
    >
      <path d="M240-200v40q0 17-11.5 28.5T200-120h-40q-17 0-28.5-11.5T120-160v-320l84-240q6-18 21.5-29t34.5-11h440q19 0 34.5 11t21.5 29l84 240v320q0 17-11.5 28.5T800-120h-40q-17 0-28.5-11.5T720-160v-40H240Zm-8-360h496l-42-120H274l-42 120Zm-32 80v200-200Zm100 160q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Zm-460 40h560v-200H200v200Z" />
    </svg>
  );
}

function formatHourlyRate(amount: number): string {
  const rounded = Number.isInteger(amount) ? amount : Math.round(amount);
  return `$${rounded}`;
}

function transmissionLabel(value: string | undefined): string {
  if (!value) return "AUTO";
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("man")) return "MANUAL";
  return "AUTO";
}

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
  const [carImageError, setCarImageError] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const details = instructorProfileDetails[instructor.id];
  const reviews = getInstructorReviews(instructor.id);
  const showImage = Boolean(instructor.avatarUrl) && !imageError;
  const isOnboarding = !bookHref;
  const carImageUrl = details?.car.imageUrl;
  const showCarImage = Boolean(carImageUrl) && !carImageError;
  const isSvgCar = Boolean(carImageUrl?.endsWith(".svg"));

  const rating = instructor.rating ?? 0;
  const reviewCount = instructor.reviewCount ?? 0;
  const isTopRated = rating >= 4.8;
  const gearLabel = transmissionLabel(details?.car.transmission);

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
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-6 pt-5 [-webkit-overflow-scrolling:touch]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="relative h-44 w-full bg-[#f3f3f3] sm:h-52">
              {showCarImage && carImageUrl ? (
                <Image
                  src={carImageUrl}
                  alt={
                    details
                      ? `${details.car.year} ${details.car.make} ${details.car.model}`
                      : "Lesson car"
                  }
                  fill
                  className={
                    isSvgCar
                      ? "object-contain p-6"
                      : "object-cover object-center"
                  }
                  sizes="(max-width: 28rem) 100vw, 28rem"
                  onError={() => setCarImageError(true)}
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <CarGlyph className="h-16 w-16" />
                </div>
              )}

              <button
                type="button"
                aria-label={favorited ? "Remove from favorites" : "Favorite"}
                aria-pressed={favorited}
                onClick={() => setFavorited((value) => !value)}
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition hover:bg-[#f9f9f9]"
              >
                <HeartIcon
                  className={`h-4 w-4 ${favorited ? "text-red-500" : ""}`}
                  filled={favorited}
                />
              </button>
            </div>

            <div className="relative bg-[#f9f9f9] px-5 pb-5">
              <div className="flex justify-center">
                <div className="relative -mt-12 h-24 w-24 overflow-hidden rounded-full border-[5px] border-white bg-slate-200 text-2xl font-semibold text-slate-600 shadow-sm">
                  {showImage ? (
                    <Image
                      src={instructor.avatarUrl}
                      alt={`${instructor.name}'s profile`}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                      sizes="96px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      {instructor.initials}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
                    {instructor.name}
                  </h1>
                  {isTopRated ? (
                    <span className="mt-2 inline-flex rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
                      Top rated
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setShowReviews(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 transition hover:bg-slate-100"
                >
                  <span className="text-amber-400" aria-hidden>
                    ★
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-[11px] font-medium text-[#4b5563]">
                    {reviewCount} review{reviewCount === 1 ? "" : "s"}
                  </span>
                </button>
              </div>

              <div className="mt-4 border-t border-slate-200" />

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-slate-900 uppercase">
                  <CarGlyph className="h-3.5 w-3.5" />
                  {gearLabel}
                </span>

                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {formatHourlyRate(instructor.pricePerHour)}
                  <span className="text-xl font-bold">/hr</span>
                </p>
              </div>

              <button
                type="button"
                aria-busy={isBooking}
                onClick={handleBookLesson}
                className={`mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 ${
                  isBooking ? "pointer-events-none" : ""
                }`}
              >
                {isBooking ? <ButtonSpinner inverse /> : "Book Now"}
              </button>

              {!isOnboarding && details?.phone ? (
                <a
                  href={`tel:${details.phone}`}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition hover:bg-[#f9f9f9]"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Call
                </a>
              ) : null}
            </div>
          </article>

          {details ? (
            <section className="mt-5">
              <button
                type="button"
                aria-expanded={aboutOpen}
                onClick={() => setAboutOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 rounded-xl bg-[#f9f9f9] px-4 py-3.5 text-left transition hover:bg-[#f0f0f0]"
              >
                <h2 className="text-sm font-semibold text-slate-900">About</h2>
                <ChevronRightIcon
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                    aboutOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
              {aboutOpen ? (
                <div className="mt-2 space-y-3 px-1">
                  <p className="text-sm leading-relaxed text-[#4b5563]">
                    {details.bio}
                  </p>
                  <p className="text-xs text-[#4b5563]">
                    {details.car.year} {details.car.make} {details.car.model} ·{" "}
                    {details.car.color} · {details.car.fuel}
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          {reviews.length > 0 ? (
            <section className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Student reviews
                </h2>
                <button
                  type="button"
                  onClick={() => setShowReviews(true)}
                  className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  See all
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {reviews.slice(0, 3).map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl bg-[#f9f9f9] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
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
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      {showReviews ? (
        <InstructorReviewsModal
          instructor={instructor}
          reviews={reviews}
          onClose={() => setShowReviews(false)}
        />
      ) : null}
    </>
  );
}
