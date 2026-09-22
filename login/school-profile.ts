import type { SiteConfig } from "@/templates/types";

export type DrivingSchoolProfile = Readonly<{
  name: string;
  logoUrl: string;
}>;

export type SchoolReviewStats = Readonly<{
  rating: number;
  reviewCount: number;
}>;

export function resolveSchoolProfile(
  data: SiteConfig,
  branding?: Readonly<{ schoolName?: string; logoUrl?: string }>,
): DrivingSchoolProfile {
  const name = branding?.schoolName?.trim() || data.schoolName?.trim() || "";
  const logoUrl =
    branding?.logoUrl?.trim() ||
    data.config?.logoUrl?.trim() ||
    data.logoUrl?.trim() ||
    "";

  return { name, logoUrl };
}

export function resolveSchoolReviews(data: SiteConfig): SchoolReviewStats {
  const rating = Number(data.rating);
  const reviewCount = Number(data.reviewCount);

  return {
    rating: Number.isFinite(rating) ? rating : 0,
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
  };
}

export function formatReviewCount(count?: number | null): string {
  if (!count) return "0";

  if (count >= 1000) {
    const rounded = Math.floor(count / 100) * 100;
    return `${rounded.toLocaleString()}+`;
  }

  return count.toLocaleString();
}
