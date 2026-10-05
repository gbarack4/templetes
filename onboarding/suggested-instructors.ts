import type { InstructorOption } from "@/types/instructor";

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
  name: "Bondi",
  fullLabel: "Bondi, NSW",
  suburb: "Bondi",
  postcode: "2026",
};

export const suggestedInstructorsInArea: SuggestedInstructor[] = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    initials: "SJ",
    avatarUrl: "/avatars/instructors/sarah-johnson.jpg",
    location: "Bondi Beach, NSW",
    rating: 4.9,
    reviewCount: 128,
    lessonsCompleted: 840,
    pricePerHour: 60,
    suburb: "Bondi",
    postcode: "2026",
    availableSlots: 5,
  },
  {
    id: "mike-chen",
    name: "Mike Chen",
    initials: "MC",
    avatarUrl: "/avatars/instructors/mike-chen.jpg",
    location: "Bondi Junction, NSW",
    rating: 4.8,
    reviewCount: 96,
    lessonsCompleted: 620,
    pricePerHour: 58,
    suburb: "Bondi",
    postcode: "2026",
    availableSlots: 3,
  },
  {
    id: "emma-williams",
    name: "Emma Williams",
    initials: "EW",
    avatarUrl: "/avatars/instructors/emma-williams.jpg",
    location: "Bronte, NSW",
    rating: 5.0,
    reviewCount: 74,
    lessonsCompleted: 510,
    pricePerHour: 62,
    suburb: "Bronte",
    postcode: "2024",
    availableSlots: 7,
  },
];

export function getSuggestedInstructorById(
  id: string,
): SuggestedInstructor | undefined {
  return suggestedInstructorsInArea.find((instructor) => instructor.id === id);
}

/** Suburbs each instructor covers beyond their home suburb. */
const instructorServiceSuburbs: Record<string, readonly string[]> = {
  "sarah-johnson": ["Bondi", "Bondi Beach", "North Bondi"],
  "mike-chen": ["Bondi", "Bondi Junction", "Waverley"],
  "emma-williams": ["Bronte", "Bondi", "Tamarama"],
};

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
> = {
  "sarah-johnson": {
    bio: "Calm, patient instructor helping first-time drivers build confidence.",
    phone: "+61400000001",
    car: {
      make: "Toyota",
      model: "Corolla",
      year: 2022,
      transmission: "Automatic",
      fuel: "Hybrid",
      color: "Blue",
      imageUrl: "/cars/toyota-corolla.jpg",
    },
  },
  "mike-chen": {
    bio: "Structured lessons focused on defensive driving and test prep.",
    phone: "+61400000002",
    car: {
      make: "Honda",
      model: "Civic",
      year: 2021,
      transmission: "Automatic",
      fuel: "Petrol",
      color: "Teal",
      imageUrl: "/cars/toyota-corolla.jpg",
    },
  },
  "emma-williams": {
    bio: "Friendly instructor with flexible scheduling around work and school.",
    phone: "+61400000003",
    car: {
      make: "Mazda",
      model: "3",
      year: 2023,
      transmission: "Automatic",
      fuel: "Petrol",
      color: "Purple",
      imageUrl: "/cars/toyota-corolla.jpg",
    },
  },
};

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

export function toPublicInstructor(
  instructor: SuggestedInstructor,
): PublicInstructor {
  return {
    id: instructor.id,
    name: instructor.name,
    phone: instructorProfileDetails[instructor.id]?.phone ?? null,
    bio: instructorProfileDetails[instructor.id]?.bio ?? null,
    pricePerHour: instructor.pricePerHour,
    avatarUrl: instructor.avatarUrl,
    suburb: instructor.suburb,
    postcode: instructor.postcode,
    schoolId: "mock-school",
    initials: instructor.initials,
    location: instructor.location,
    rating: instructor.rating,
    reviewCount: instructor.reviewCount,
    lessonsCompleted: instructor.lessonsCompleted,
    availableSlots: [],
    lowestEligiblePrice: instructor.pricePerHour,
    monthlyAvailableSlotCount: instructor.availableSlots,
  };
}
