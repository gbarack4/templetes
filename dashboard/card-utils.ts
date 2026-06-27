export interface SavedPaymentMethod {
  cardholderName: string;
  last4: string;
  expiry: string;
  brand: string;
}

export function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function getCardBrand(cardNumber: string) {
  const firstDigit = cardNumber.replace(/\D/g, "")[0];
  if (firstDigit === "4") return "Visa";
  if (firstDigit === "5") return "Mastercard";
  if (firstDigit === "3") return "Amex";
  return "Card";
}

export function isCardFormValid(
  cardNumber: string,
  expiry: string,
  cvc: string,
  cardholderName?: string,
) {
  const cardDigits = cardNumber.replace(/\D/g, "");
  const hasName = cardholderName === undefined || cardholderName.trim().length > 0;

  return (
    hasName &&
    cardDigits.length >= 15 &&
    expiry.length >= 5 &&
    cvc.length >= 3
  );
}
