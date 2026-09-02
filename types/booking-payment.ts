export interface CreateBookingPayload {
  instructorId: string;
  packageId: string;

  pickupAddress: string;
  pickupSuburb: string;
  pickupPostcode?: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupGooglePlaceId?: string;

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
