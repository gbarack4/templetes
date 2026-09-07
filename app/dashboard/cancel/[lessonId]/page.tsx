import type { Metadata } from "next";

import { CancelBookingFlow } from "@/dashboard/CancelBookingFlow";

type CancelBookingPageProps = Readonly<{
  params: Promise<{ lessonId: string }>;
}>;

export const metadata: Metadata = {
  title: "Cancel Booking | Driving School",
};

export default async function CancelBookingPage({
  params,
}: CancelBookingPageProps) {
  const { lessonId } = await params;

  return <CancelBookingFlow lessonId={lessonId} />;
}
