export type BookingInstructor = {
  id: string;
  name: string;
  avatarUrl: string | null;
  pricePerHour: string | null;
  suburb: string | null;
  postcode: string | null;
  transmissionType: string | null;
};

export type InstructorOption = {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;
  location: string;
  pricePerHour: number | null;
  rating?: number | null;
  reviewCount?: number;
  lessonsCompleted?: number;
};
