import type { SiteConfig } from "@/templates/types";

export type DrivingSchoolProfile = Readonly<{
  name: string;
  logoUrl: string;
}>;

export const mockDrivingSchool: DrivingSchoolProfile = {
  name: "DriveRight Academy",
  logoUrl: "/schools/drive-right-logo.svg",
};

export const mockGoogleReviews = {
  rating: 4.9,
  reviewCount: 2400,
} as const;

export function resolveSchoolProfile(
  data: SiteConfig,
  branding?: Readonly<{ schoolName?: string; logoUrl?: string }>,
  options?: Readonly<{ fallbackToMock?: boolean }>,
): DrivingSchoolProfile {
  const fallbackToMock = options?.fallbackToMock ?? false;
  const name =
    branding?.schoolName?.trim() ||
    data.schoolName?.trim() ||
    (fallbackToMock ? mockDrivingSchool.name : "");
  const logoUrl =
    branding?.logoUrl?.trim() ||
    data.config?.logoUrl?.trim() ||
    data.logoUrl?.trim() ||
    (fallbackToMock ? mockDrivingSchool.logoUrl : "");

  return { name, logoUrl };
}

export function resolveGoogleReviews(data: SiteConfig) {
  return {
    rating: data.googleRating ?? mockGoogleReviews.rating,
    reviewCount: data.googleReviewCount ?? mockGoogleReviews.reviewCount,
  };
}

export function formatReviewCount(count: number): string {
  if (count >= 1000) {
    const rounded = Math.floor(count / 100) * 100;
    return `${rounded.toLocaleString()}+`;
  }
  return count.toLocaleString();
}
