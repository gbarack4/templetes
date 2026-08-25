export type Transmission = "manual" | "automatic";

export async function searchPublicInstructors(
  schoolId: string,
  suburb: string,
  transmission?: Transmission,
  preferredDate?: string,
) {
  const params = new URLSearchParams({
    suburb,
  });

  if (transmission) {
    params.set("transmission", transmission);
  }

  if (preferredDate) {
    params.set("preferredDate", preferredDate);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/schools/${schoolId}/instructors?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function fetchPublicInstructor(
  schoolId: string,
  instructorId: string,
  suburb: string,
  preferredDate: string,
) {
  const params = new URLSearchParams({
    suburb,
    preferredDate,
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/schools/${schoolId}/instructors/${instructorId}?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export type PublicPackage = {
  id: string;
  name: string;
  durationMinutes: number;
  price: string;
};

export async function fetchPublicPackages(
  schoolId: string,
  suburb: string,
): Promise<PublicPackage[]> {
  const params = new URLSearchParams({ suburb });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/school-packages/${schoolId}?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch packages");
  }

  return response.json();
}

export async function fetchAvailableSlots(
  instructorId: string,
  packageId: string,
  date: string,
  suburb: string,
) {
  const params = new URLSearchParams({
    instructorId,
    packageId,
    date,
    suburb,
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/bookings/slots?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch slots");
  }

  return response.json();
}
