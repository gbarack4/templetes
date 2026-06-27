"use client";

import {
  formatCardNumber,
  formatExpiry,
} from "../card-utils";

type CreditCardFieldsProps = Readonly<{
  cardholderName?: string;
  onCardholderNameChange?: (value: string) => void;
  cardNumber: string;
  expiry: string;
  cvc: string;
  onCardNumberChange: (value: string) => void;
  onExpiryChange: (value: string) => void;
  onCvcChange: (value: string) => void;
  idPrefix?: string;
}>;

export function CreditCardFields({
  cardholderName,
  onCardholderNameChange,
  cardNumber,
  expiry,
  cvc,
  onCardNumberChange,
  onExpiryChange,
  onCvcChange,
  idPrefix = "card",
}: CreditCardFieldsProps) {
  return (
    <div className="space-y-3">
      {onCardholderNameChange && (
        <div className="space-y-1.5">
          <label
            htmlFor={`${idPrefix}-name`}
            className="text-sm font-medium text-slate-900"
          >
            Name on card
          </label>
          <input
            id={`${idPrefix}-name`}
            type="text"
            autoComplete="cc-name"
            placeholder="George Smith"
            value={cardholderName ?? ""}
            onChange={(event) => onCardholderNameChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-number`} className="text-sm font-medium text-slate-900">
          Card number
        </label>
        <input
          id={`${idPrefix}-number`}
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(event) => onCardNumberChange(formatCardNumber(event.target.value))}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-expiry`} className="text-sm font-medium text-slate-900">
            Expiry
          </label>
          <input
            id={`${idPrefix}-expiry`}
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={expiry}
            onChange={(event) => onExpiryChange(formatExpiry(event.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-cvc`} className="text-sm font-medium text-slate-900">
            CVC
          </label>
          <input
            id={`${idPrefix}-cvc`}
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={cvc}
            onChange={(event) =>
              onCvcChange(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
}
