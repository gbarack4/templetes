export interface CreateBookingPayload {
  instructorId: string;
  packageId: string;
  pickupSuburb: string;
  pickupPostcode?: string;
  startDatetime: string;
  notes?: string;
}

export interface CreateBookingResponse {
  id: string;
}

export interface CreatePackagePaymentResponse {
  bookingId: string;
  packagePurchaseId: string;
  paymentIntentId: string;
  clientSecret: string | null;
  stripeAccountId: string;
  status: string;
  expiresAt: string;
}

export interface PackagePaymentStatusResponse {
  bookingId: string;
  bookingStatus: string;
  paymentStatus: string | null;
}
