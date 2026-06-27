"use client";

import { useState } from "react";
import { formatCurrency } from "../mock-data";
import { isCardFormValid } from "../card-utils";
import { CreditCardFields } from "./CreditCardFields";
import { CreditCardIcon } from "./icons";

type CardPaymentFormProps = Readonly<{
  amount: number;
  onComplete: () => void;
  onBack?: () => void;
  backLabel?: string;
}>;

export function CardPaymentForm({
  amount,
  onComplete,
  onBack,
  backLabel = "Go back",
}: CardPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const canPay = !isProcessing && isCardFormValid(cardNumber, expiry, cvc);

  async function handlePay() {
    if (!canPay) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsProcessing(false);
    onComplete();
  }

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Payment method</h2>
        </div>

        <CreditCardFields
          idPrefix="checkout"
          cardNumber={cardNumber}
          expiry={expiry}
          cvc={cvc}
          onCardNumberChange={setCardNumber}
          onExpiryChange={setExpiry}
          onCvcChange={setCvc}
        />
      </section>

      <button
        type="button"
        onClick={handlePay}
        disabled={!canPay}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {isProcessing ? "Processing..." : `Pay ${formatCurrency(amount)}`}
      </button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          {backLabel}
        </button>
      )}
    </>
  );
}
