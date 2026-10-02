import type { SessionTokens, StudentProfileInput, SyncResult } from "./types";

export async function syncStudentSession(
  schoolId: string,
  tokens: SessionTokens,
  profile?: StudentProfileInput,
): Promise<SyncResult> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/sync`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "x-cognito-id-token": tokens.idToken,
      "x-school-id": schoolId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ schoolId, ...(profile ? { profile } : {}) }),
  });
  if (!response.ok) {
    throw new Error(
      `Unable to complete your student profile (${response.status}). Please try again.`,
    );
  }
  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== "object" ||
    !("schoolId" in body) ||
    body.schoolId !== schoolId ||
    !("userId" in body) ||
    typeof body.userId !== "string" ||
    !("email" in body) ||
    typeof body.email !== "string" ||
    !("profileRequired" in body) ||
    typeof body.profileRequired !== "boolean" ||
    !("studentId" in body) ||
    !(body.studentId === null || typeof body.studentId === "string")
  ) {
    throw new Error("The server returned an invalid student profile.");
  }
  if (!body.profileRequired && !body.studentId) {
    throw new Error("The student profile is incomplete.");
  }
  return {
    schoolId,
    userId: body.userId,
    email: body.email,
    studentId: body.studentId,
    profileRequired: body.profileRequired,
  };
}
