"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlowPageHeader } from "@/dashboard/components/FlowPageHeader";
import { formatCurrency } from "@/dashboard/mock-data";
import { getInstructorReviews } from "./instructor-reviews";
import { InstructorReviewsModal } from "./InstructorReviewsModal";
import {
  instructorProfileDetails,
  type SuggestedInstructor,
} from "./suggested-instructors";

type InstructorProfileProps = Readonly<{
  instructor: SuggestedInstructor;
  basePath?: string;
}>;

export function InstructorProfile({
  instructor,
  basePath = "/preview/onboarding",
}: InstructorProfileProps) {
  const router = useRouter();
  const [showReviews, setShowReviews] = useState(false);
  const details = instructorProfileDetails[instructor.id];
  const reviews = getInstructorReviews(instructor.id);

  return (
    <>
      <FlowPageHeader title="Instructor profile" onBack={() => router.back()} />
      <main className="flex flex-1 flex-col px-5 pb-8 pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-2xl font-semibold text-slate-600">
            {instructor.initials}
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">{instructor.name}</h1>
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

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Rate</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatCurrency(instructor.pricePerHour)}/hr
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Area</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{instructor.location}</p>
          </div>
        </div>

        {details && (
          <>
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-slate-900">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{details.bio}</p>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-semibold text-slate-900">Lesson car</h2>
              <div className="mt-3 overflow-hidden rounded-xl bg-slate-50">
                <div className="relative aspect-[16/9] w-full bg-slate-100">
                  <Image
                    src={details.car.imageUrl}
                    alt={`${details.car.year} ${details.car.make} ${details.car.model}`}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 p-4">
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
                    <p className="mt-1 text-sm font-semibold text-slate-900">{details.car.color}</p>
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
                    <p className="mt-1 text-sm font-semibold text-slate-900">{details.car.fuel}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <Link
          href={`${basePath}/book/${instructor.id}`}
          className="mt-8 block w-full rounded-lg bg-blue-600 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Book now
        </Link>
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
