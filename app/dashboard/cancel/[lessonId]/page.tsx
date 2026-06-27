import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLessonById } from "@/dashboard/mock-data";
import { CancelBookingFlow } from "@/dashboard/CancelBookingFlow";

type CancelBookingPageProps = Readonly<{
  params: Promise<{ lessonId: string }>;
}>;

export async function generateMetadata({
  params,
}: CancelBookingPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  return {
    title: lesson
      ? "Cancel Booking | Driving School"
      : "Lesson Not Found | Driving School",
  };
}

export default async function CancelBookingPage({ params }: CancelBookingPageProps) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (!lesson || lesson.status !== "upcoming") {
    notFound();
  }

  return <CancelBookingFlow lesson={lesson} />;
}
