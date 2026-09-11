import type { Metadata } from "next";

import { RescheduleFlow } from "@/dashboard/RescheduleFlow";

type ReschedulePageProps = Readonly<{
  params: Promise<{ lessonId: string }>;
}>;

export const metadata: Metadata = {
  title: "Reschedule Lesson | Driving School",
};

export default async function ReschedulePage({ params }: ReschedulePageProps) {
  const { lessonId } = await params;

  return <RescheduleFlow lessonId={lessonId} />;
}
