import type {
  CreateBookingPayload,
  CreateBookingResponse,
  CreatePackagePaymentResponse,
  PackagePaymentStatusResponse,
} from "@/types/booking-payment";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createBooking(
  schoolId: string,
  token: string,
  payload: CreateBookingPayload,
): Promise<CreateBookingResponse> {
  const response = await fetch(`${API_URL}/bookings/school/${schoolId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "Failed to create booking");
  }

  return response.json();
}

export async function createPackagePayment(
  schoolId: string,
  bookingId: string,
  token: string,
): Promise<CreatePackagePaymentResponse> {
  const response = await fetch(
    `${API_URL}/payments/school/${schoolId}/package`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "Failed to create payment");
  }

  return response.json();
}

export async function syncStudent(
  schoolId: string,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/students/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      schoolId,
    }),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "Failed to sync student");
  }
}

export async function getPackagePaymentStatus(
  schoolId: string,
  bookingId: string,
  token: string,
): Promise<PackagePaymentStatusResponse> {
  const response = await fetch(
    `${API_URL}/payments/school/${schoolId}/package/${bookingId}/status`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "Failed to get payment status");
  }

  return response.json();
}
