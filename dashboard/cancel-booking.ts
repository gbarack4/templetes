const STORAGE_KEY = "cancelled-lesson-id";

export function markLessonCancelled(lessonId: string) {
  sessionStorage.setItem(STORAGE_KEY, lessonId);
}

export function consumeCancelledLessonId(): string | null {
  const lessonId = sessionStorage.getItem(STORAGE_KEY);
  if (lessonId) {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  return lessonId;
}
