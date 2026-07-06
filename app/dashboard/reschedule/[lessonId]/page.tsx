import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLessonById } from "@/dashboard/mock-data";
import { RescheduleFlow } from "@/dashboard/RescheduleFlow";

type ReschedulePageProps = Readonly<{
  params: Promise<{ lessonId: string }>;
}>;

export async function generateMetadata({
  params,
}: ReschedulePageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  return {
    title: lesson
      ? "Reschedule Lesson | Driving School"
      : "Lesson Not Found | Driving School",
  };
}

export default async function ReschedulePage({ params }: ReschedulePageProps) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (lesson?.status !== "upcoming") {
    notFound();
  }

  return <RescheduleFlow lesson={lesson} />;
}
