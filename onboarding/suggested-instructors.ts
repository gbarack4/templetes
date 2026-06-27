import type { InstructorOption } from "@/dashboard/mock-data";
import { mockInstructors } from "@/dashboard/mock-data";

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
  }>;

export const mockStudentArea: StudentArea = {
  name: "Downtown",
  fullLabel: "Downtown, Seattle",
  suburb: "Downtown",
  postcode: "98101",
};

export const suggestedInstructorsInArea: SuggestedInstructor[] = [
  {
    ...mockInstructors[0],
    pricePerHour: 60,
    suburb: "Downtown",
    postcode: "98101",
  },
  {
    ...mockInstructors[1],
    pricePerHour: 58,
    suburb: "Westside",
    postcode: "98109",
  },
  {
    ...mockInstructors[2],
    pricePerHour: 62,
    suburb: "Eastside",
    postcode: "98112",
  },
  {
    id: "james-rodriguez",
    name: "James Rodriguez",
    initials: "JR",
    location: "220 Northgate Way, Northgate",
    rating: 4.7,
    reviewCount: 112,
    lessonsCompleted: 730,
    pricePerHour: 57,
    suburb: "Northgate",
    postcode: "98125",
  },
  {
    id: "lisa-patel",
    name: "Lisa Patel",
    initials: "LP",
    location: "15 Broadway East, Capitol Hill",
    rating: 4.9,
    reviewCount: 89,
    lessonsCompleted: 590,
    pricePerHour: 61,
    suburb: "Capitol Hill",
    postcode: "98102",
  },
  {
    id: "tom-anderson",
    name: "Tom Anderson",
    initials: "TA",
    location: "5300 Ballard Avenue NW, Ballard",
    rating: 4.8,
    reviewCount: 103,
    lessonsCompleted: 680,
    pricePerHour: 59,
    suburb: "Ballard",
    postcode: "98107",
  },
  {
    id: "nina-brooks",
    name: "Nina Brooks",
    initials: "NB",
    location: "800 Queen Anne Avenue N, Queen Anne",
    rating: 5.0,
    reviewCount: 67,
    lessonsCompleted: 445,
    pricePerHour: 63,
    suburb: "Queen Anne",
    postcode: "98109",
  },
  {
    id: "david-kim",
    name: "David Kim",
    initials: "DK",
    location: "9800 Rainier Avenue S, Rainier Valley",
    rating: 4.8,
    reviewCount: 91,
    lessonsCompleted: 560,
    pricePerHour: 56,
    suburb: "Rainier Valley",
    postcode: "98118",
  },
];

export const onboardingInstructorProfilePath = "/preview/onboarding/instructor";
export const onboardingBookPath = "/preview/onboarding/book";

export function getSuggestedInstructorById(id: string): SuggestedInstructor | undefined {
  return suggestedInstructorsInArea.find((instructor) => instructor.id === id);
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
  Readonly<{ bio: string; car: InstructorCar }>
> = {
  "sarah-johnson": {
    bio: "Calm, patient instructor with 8 years of experience helping nervous first-time drivers build confidence on city roads.",
    car: {
      make: "Toyota",
      model: "Corolla",
      year: 2022,
      transmission: "Automatic",
      fuel: "Hybrid",
      color: "Blue",
      imageUrl: "/cars/toyota-corolla.svg",
    },
  },
  "mike-chen": {
    bio: "Structured lessons focused on defensive driving and test preparation for busy urban routes.",
    car: {
      make: "Honda",
      model: "Civic",
      year: 2021,
      transmission: "Automatic",
      fuel: "Petrol",
      color: "Teal",
      imageUrl: "/cars/honda-civic.svg",
    },
  },
  "emma-williams": {
    bio: "Friendly instructor known for clear explanations and flexible scheduling around school and work hours.",
    car: {
      make: "Mazda",
      model: "3",
      year: 2023,
      transmission: "Automatic",
      fuel: "Petrol",
      color: "Purple",
      imageUrl: "/cars/mazda-3.svg",
    },
  },
  "james-rodriguez": {
    bio: "Experienced with suburban routes and merge lanes. Great for students preparing for longer commutes.",
    car: {
      make: "Hyundai",
      model: "Elantra",
      year: 2022,
      transmission: "Automatic",
      fuel: "Petrol",
      color: "Silver",
      imageUrl: "/cars/toyota-corolla.svg",
    },
  },
  "lisa-patel": {
    bio: "Detail-oriented instructor who focuses on observation skills and safe decision-making in dense traffic.",
    car: {
      make: "Volkswagen",
      model: "Golf",
      year: 2021,
      transmission: "Automatic",
      fuel: "Petrol",
      color: "White",
      imageUrl: "/cars/honda-civic.svg",
    },
  },
  "tom-anderson": {
    bio: "Relaxed teaching style with a strong emphasis on parking, tight streets, and neighborhood driving.",
    car: {
      make: "Subaru",
      model: "Impreza",
      year: 2020,
      transmission: "Automatic",
      fuel: "Petrol",
      color: "Green",
      imageUrl: "/cars/mazda-3.svg",
    },
  },
  "nina-brooks": {
    bio: "Top-rated for teen drivers and first-lesson confidence building on hills and busy intersections.",
    car: {
      make: "Kia",
      model: "Cerato",
      year: 2023,
      transmission: "Automatic",
      fuel: "Hybrid",
      color: "Red",
      imageUrl: "/cars/toyota-corolla.svg",
    },
  },
  "david-kim": {
    bio: "Patient with beginners and fluent in explaining road rules for students from diverse driving backgrounds.",
    car: {
      make: "Nissan",
      model: "Sentra",
      year: 2021,
      transmission: "Automatic",
      fuel: "Petrol",
      color: "Grey",
      imageUrl: "/cars/honda-civic.svg",
    },
  },
};
