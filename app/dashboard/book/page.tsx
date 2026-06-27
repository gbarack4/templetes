import type { Metadata } from "next";
import { BookLessonFlow } from "@/dashboard/BookLessonFlow";

export const metadata: Metadata = {
  title: "Book Lesson | Driving School",
  description: "Book a new driving lesson.",
};

export default function BookLessonPage() {
  return <BookLessonFlow />;
}
