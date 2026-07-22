import { getToken } from "@clerk/nextjs";

export async function fetchStudentProfile(schoolId: string) {
  const token = await getToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/students/school/${schoolId}/me`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch student profile");
  }

  return response.json();
}
