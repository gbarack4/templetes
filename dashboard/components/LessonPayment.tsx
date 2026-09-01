"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";

import type { InstructorOption } from "../mock-data";
import {
  calculateLessonPayment,
  formatCurrency,
  LESSON_HOUR_RATE,
} from "../mock-data";
import { InstructorProfileSummary } from "./InstructorSearch";
import { CreditCardIcon } from "./icons";

type LessonPaymentProps = Readonly<{
  instructor: InstructorOption;
  dateLabel: string;
  timeLabel: string;
  hours: number;
  lessonHours?: number;
  payment: ReturnType<typeof calculateLessonPayment>;
  clientSecret: string;
  stripeAccountId: string;
  hourRate?: number;
  onBack: () => void;
  onComplete: () => void | Promise<void>;
}>;

type StripePaymentFormProps = Readonly<{
  instructor: InstructorOption;
  dateLabel: string;
  timeLabel: string;
  hours: number;
  lessonHours: number;
  payment: ReturnType<typeof calculateLessonPayment>;
  hourRate: number;
  onBack: () => void;
  onComplete: () => void | Promise<void>;
}>;

const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

function StripePaymentForm({
  instructor,
  dateLabel,
  timeLabel,
  hours,
  lessonHours,
  payment,
  hourRate,
  onBack,
  onComplete,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message ?? "Please check your payment details.");
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        setError(result.error.message ?? "Payment failed. Please try again.");
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        await onComplete();
        return;
      }

      if (result.paymentIntent?.status === "processing") {
        setError(
          "Your payment is still processing. Please wait before continuing.",
        );
        return;
      }

      setError("Payment was not completed. Please try again.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to process payment. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="flex-1 space-y-6 px-5 pb-24 pt-6">
      <section className="rounded-2xl bg-[#f9f9f9] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Lesson summary
        </p>

        <p className="mt-2 font-semibold text-slate-900">{dateLabel}</p>

        <p className="mt-1 text-sm text-slate-600">{timeLabel}</p>

        <p className="mt-1 text-sm text-[#4b5563]">
          {lessonHours} {lessonHours === 1 ? "hour" : "hours"}
        </p>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <InstructorProfileSummary instructor={instructor} />
        </div>
      </section>

      <section className="rounded-2xl bg-[#f9f9f9] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Payment summary
        </p>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>
              {hours} {hours === 1 ? "hour" : "hours"} ×{" "}
              {formatCurrency(hourRate)}
            </span>

            <span>{formatCurrency(payment.subtotal)}</span>
          </div>

          {payment.creditHoursUsed > 0 && (
            <div className="flex items-center justify-between text-green-600">
              <span>Credit applied ({payment.creditHoursUsed} hrs)</span>

              <span>-{formatCurrency(payment.creditDiscount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
            <span>Total due</span>

            <span>{formatCurrency(payment.totalDue)}</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5 text-[#4b5563]" />

          <h2 className="text-sm font-semibold text-slate-900">
            Payment method
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <PaymentElement />
        </div>
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || !elements || isProcessing}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {isProcessing
          ? "Processing..."
          : `Pay ${formatCurrency(payment.totalDue)}`}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={isProcessing}
        className="w-full py-2 text-sm font-medium text-[#4b5563] transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Back to booking
      </button>
    </main>
  );
}

export function LessonPayment({
  instructor,
  dateLabel,
  timeLabel,
  hours,
  lessonHours = hours,
  payment,
  clientSecret,
  stripeAccountId,
  hourRate = LESSON_HOUR_RATE,
  onBack,
  onComplete,
}: LessonPaymentProps) {
  const stripePromise = useMemo(() => {
    if (!STRIPE_PUBLISHABLE_KEY || !stripeAccountId) {
      return null;
    }

    return loadStripe(STRIPE_PUBLISHABLE_KEY, {
      stripeAccount: stripeAccountId,
    });
  }, [stripeAccountId]);

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <main className="flex-1 px-5 pb-24 pt-6">
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          Stripe publishable key is not configured.
        </div>
      </main>
    );
  }

  if (!stripePromise || !clientSecret) {
    return (
      <main className="flex-1 px-5 pb-24 pt-6">
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          Unable to initialize payment.
        </div>
      </main>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
      }}
    >
      <StripePaymentForm
        instructor={instructor}
        dateLabel={dateLabel}
        timeLabel={timeLabel}
        hours={hours}
        lessonHours={lessonHours}
        payment={payment}
        hourRate={hourRate}
        onBack={onBack}
        onComplete={onComplete}
      />
    </Elements>
  );
}
