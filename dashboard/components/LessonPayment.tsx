"use client";

import { useState } from "react";
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
  payment: ReturnType<typeof calculateLessonPayment>;
  hourRate?: number;
  onBack: () => void;
  onComplete: () => void;
}>;

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function LessonPayment({
  instructor,
  dateLabel,
  timeLabel,
  hours,
  payment,
  hourRate = LESSON_HOUR_RATE,
  onBack,
  onComplete,
}: LessonPaymentProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const requiresCard = payment.totalDue > 0;
  const cardDigits = cardNumber.replace(/\D/g, "");
  const canPay =
    !isProcessing &&
    (!requiresCard ||
      (cardDigits.length >= 15 && expiry.length >= 5 && cvc.length >= 3));

  async function handlePay() {
    if (!canPay) return;

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsProcessing(false);
    onComplete();
  }

  return (
    <>
      <main className="flex-1 space-y-6 px-5 pb-24 pt-6">
        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Lesson summary
          </p>
          <p className="mt-2 font-semibold text-slate-900">{dateLabel}</p>
          <p className="mt-1 text-sm text-slate-600">{timeLabel}</p>
          <p className="mt-1 text-sm text-slate-500">
            {hours} {hours === 1 ? "hour" : "hours"}
          </p>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <InstructorProfileSummary instructor={instructor} />
          </div>
        </section>

        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Payment summary
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>
                {hours} {hours === 1 ? "hour" : "hours"} × {formatCurrency(hourRate)}
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

        {requiresCard ? (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Payment method</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="card-number" className="text-sm font-medium text-slate-900">
                  Card number
                </label>
                <input
                  id="card-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="card-expiry" className="text-sm font-medium text-slate-900">
                    Expiry
                  </label>
                  <input
                    id="card-expiry"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="card-cvc" className="text-sm font-medium text-slate-900">
                    CVC
                  </label>
                  <input
                    id="card-cvc"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={cvc}
                    onChange={(event) =>
                      setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-green-50 p-4 text-sm text-green-700">
            This lesson is fully covered by your available credit. No card payment needed.
          </section>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={!canPay}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isProcessing
            ? "Processing..."
            : payment.totalDue > 0
              ? `Pay ${formatCurrency(payment.totalDue)}`
              : "Confirm with credit"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          Back to booking
        </button>
      </main>
    </>
  );
}
