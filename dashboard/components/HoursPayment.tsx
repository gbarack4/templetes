"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useRef, useState } from "react";
import {
  formatPaymentAmount,
  type HoursPayment as Payment,
} from "@/lib/hours-payment-api";

type Props = {
  payment: Payment;
  onProcessing: () => void;
  onCancel: () => Promise<void>;
};

function PaymentForm({ payment, onProcessing, onCancel }: Readonly<Props>) {
  const stripe = useStripe();
  const elements = useElements();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  async function pay() {
    if (!stripe || !elements || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const submitted = await elements.submit();
      if (submitted.error)
        throw new Error(
          submitted.error.message ?? "Check your payment details.",
        );
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (result.error)
        throw new Error(
          result.error.message ?? "Payment could not be completed.",
        );
      if (
        result.paymentIntent?.status === "succeeded" ||
        result.paymentIntent?.status === "processing"
      ) {
        onProcessing();
      } else {
        throw new Error(
          "Payment is not complete. Please check your payment details.",
        );
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to complete payment. Please try again.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function cancel() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await onCancel();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to cancel payment.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement
        onReady={() => setReady(true)}
        onLoadError={() =>
          setError("Unable to load Stripe. Please reload and try again.")
        }
      />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={!stripe || !elements || !ready || busy}
        onClick={() => void pay()}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy
          ? "Please wait..."
          : `Pay ${formatPaymentAmount(payment.amount, payment.currency)}`}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => void cancel()}
        className="w-full py-2 text-sm text-slate-600"
      >
        Choose another package
      </button>
    </div>
  );
}

export function HoursPayment(props: Readonly<Props>) {
  const stripe = useMemo(
    () => loadStripe(props.payment.publishableKey),
    [props.payment.publishableKey],
  );
  if (!props.payment.clientSecret)
    return <p role="alert">Unable to initialize payment.</p>;
  return (
    <Elements
      stripe={stripe}
      options={{ clientSecret: props.payment.clientSecret }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
}
