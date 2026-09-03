import type { InstructorOption } from "@/dashboard/mock-data";

export type StudentArea = Readonly<{
  name: string;
  fullLabel: string;
  suburb: string;
  postcode: string;
}>;

export type SuggestedInstructor = InstructorOption &
  Readonly<{
    pricePerHour: number;
    suburb: string;
    postcode: string;
    availableSlots: number;
  }>;

export const mockStudentArea: StudentArea = {
  name: "",
  fullLabel: "",
  suburb: "",
  postcode: "",
};

export const suggestedInstructorsInArea: SuggestedInstructor[] = [];

export function getSuggestedInstructorById(
  id: string,
): SuggestedInstructor | undefined {
  return suggestedInstructorsInArea.find((instructor) => instructor.id === id);
}

/** Suburbs each instructor covers beyond their home suburb. */
const instructorServiceSuburbs: Record<string, readonly string[]> = {};

function normalizeLocationQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function instructorMatchesSuburb(
  instructor: SuggestedInstructor,
  query: string,
): boolean {
  const trimmed = normalizeLocationQuery(query);
  if (!trimmed) return true;

  const normalizedPostcode = trimmed.replace(/\s+/g, "");
  const homeSuburb = instructor.suburb.toLowerCase();
  const homePostcode = instructor.postcode.toLowerCase();

  if (
    homeSuburb === trimmed ||
    homeSuburb.includes(trimmed) ||
    trimmed.includes(homeSuburb) ||
    homePostcode.includes(normalizedPostcode) ||
    normalizedPostcode.includes(homePostcode)
  ) {
    return true;
  }

  const serviceAreas = instructorServiceSuburbs[instructor.id] ?? [
    instructor.suburb,
  ];
  return serviceAreas.some((suburb) => {
    const normalizedSuburb = suburb.toLowerCase();
    return (
      normalizedSuburb === trimmed ||
      normalizedSuburb.includes(trimmed) ||
      trimmed.includes(normalizedSuburb)
    );
  });
}

export function getInstructorsForSuburb(
  query: string,
  instructors: readonly SuggestedInstructor[] = suggestedInstructorsInArea,
): SuggestedInstructor[] {
  return instructors.filter((instructor) =>
    instructorMatchesSuburb(instructor, query),
  );
}

export type InstructorCar = Readonly<{
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuel: string;
  color: string;
  imageUrl: string;
}>;

export const instructorProfileDetails: Record<
  string,
  Readonly<{ bio: string; phone: string; car: InstructorCar }>
> = {};

type AvailableSlot = {
  instructorId: string;
  startDatetime: string;
  endDatetime: string;
};

export type PublicInstructor = {
  id: string;
  name: string;
  phone: string | null;
  bio: string | null;
  pricePerHour: number;
  avatarUrl: string;
  suburb: string | null;
  postcode: string | null;
  schoolId: string;
  initials: string;
  location: string;
  rating: number;
  reviewCount: number;
  lessonsCompleted: number;
  availableSlots: AvailableSlot[];
  lowestEligiblePrice: number | null;
  monthlyAvailableSlotCount: number;
};
