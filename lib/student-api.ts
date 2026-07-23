export async function fetchStudentProfile(
  schoolId: string,
  token: string | null,
) {
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

export async function updateStudentAvatar(
  schoolId: string,
  avatarUrl: string | null,
  token: string | null,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/students/school/${schoolId}/me/avatar`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ avatarUrl }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update student avatar");
  }

  return response.json();
}
