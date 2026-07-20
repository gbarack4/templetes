"use client";

import { useState } from "react";
import { getCardBrand, isCardFormValid } from "./card-utils";
import { CreditCardFields } from "./components/CreditCardFields";
import { CreditCardIcon } from "./components/icons";
import { useSavedPaymentMethod } from "./useSavedPaymentMethod";

export function PaymentsSettings() {
  const [savedMethod, setSavedMethod] = useSavedPaymentMethod();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [cardholderName, setCardholderName] = useState(savedMethod.cardholderName);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const canSave = isCardFormValid(cardNumber, expiry, cvc, cardholderName);

  function openEditor() {
    setCardholderName(savedMethod.cardholderName);
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setShowSavedMessage(false);
    setIsEditing(true);
  }

  function closeEditor() {
    setIsEditing(false);
    setCardNumber("");
    setExpiry("");
    setCvc("");
  }

  async function handleSave() {
    if (!canSave) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const digits = cardNumber.replace(/\D/g, "");
    setSavedMethod({
      cardholderName: cardholderName.trim(),
      last4: digits.slice(-4),
      expiry,
      brand: getCardBrand(cardNumber),
    });

    setIsSaving(false);
    setIsEditing(false);
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setShowSavedMessage(true);
  }

  return (
    <main className="flex-1 space-y-6 px-5 pb-6 pt-6">
      <section>
        <h1 className="text-xl font-bold text-slate-900">Payments</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Manage your saved card for lesson bookings and hour packages.
        </p>
      </section>

      {showSavedMessage && !isEditing && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Your card has been updated.
        </p>
      )}

      <section className="rounded-2xl bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
              <CreditCardIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Saved card
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {savedMethod.brand} ·•••• {savedMethod.last4}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                Expires {savedMethod.expiry} · {savedMethod.cardholderName}
              </p>
            </div>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={openEditor}
            className="mt-4 w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Update card
          </button>
        )}
      </section>

      {isEditing && (
        <section className="space-y-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Update card details</h2>
            <button
              type="button"
              onClick={closeEditor}
              className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <CreditCardFields
            idPrefix="payments"
            cardholderName={cardholderName}
            onCardholderNameChange={setCardholderName}
            cardNumber={cardNumber}
            expiry={expiry}
            cvc={cvc}
            onCardNumberChange={setCardNumber}
            onExpiryChange={setExpiry}
            onCvcChange={setCvc}
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isSaving ? "Saving..." : "Save card"}
          </button>
        </section>
      )}

      <section className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Recent payments
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Your lesson and package payments will appear here.
        </p>
      </section>
    </main>
  );
}
