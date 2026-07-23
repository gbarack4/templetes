import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingsFlow } from "@/dashboard/BookingsFlow";

export const metadata: Metadata = {
  title: "Bookings | Driving School",
  description: "View and search all your lesson bookings.",
};

export default function BookingsPage() {
  return (
    <Suspense fallback={null}>
      <BookingsFlow />
    </Suspense>
  );
}
