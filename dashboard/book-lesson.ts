import type { Lesson } from "./types";

const STORAGE_KEY = "booked-lesson";

export function markLessonBooked(lesson: Lesson) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lesson));
}

export function consumeBookedLesson(): Lesson | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(STORAGE_KEY);

  try {
    return JSON.parse(raw) as Lesson;
  } catch {
    return null;
  }
}
