import type { SiteConfig } from "@/templates/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Normalize public website API payloads into the SiteConfig shape templates expect. */
export function normalizeSiteConfig(raw: unknown): SiteConfig | null {
  const data = asRecord(raw);
  if (!data) return null;

  const config = asRecord(data.config) ?? {};
  const school = asRecord(data.school) ?? {};

  const schoolName =
    asString(data.schoolName) ||
    asString(school.name) ||
    asString(school.schoolName) ||
    asString(data.name);

  const logoUrl =
    asString(config.logoUrl) ||
    asString(data.logoUrl) ||
    asString(school.logoUrl) ||
    asString(school.logo) ||
    asString(data.logo);

  const templateName =
    asString(data.templateName) ||
    asString(data.template) ||
    "classic";

  return {
    schoolId: asString(data.schoolId) || asString(school.id) || undefined,
    schoolName,
    templateName,
    logoUrl: logoUrl || undefined,
    googleRating:
      typeof data.googleRating === "number" ? data.googleRating : undefined,
    googleReviewCount:
      typeof data.googleReviewCount === "number"
        ? data.googleReviewCount
        : undefined,
    phoneNumber:
      asString(data.phoneNumber) ||
      asString(school.phoneNumber) ||
      undefined,
    config: {
      primaryColor: asString(config.primaryColor) || undefined,
      welcomeText: asString(config.welcomeText) || undefined,
      seoDescription: asString(config.seoDescription) || undefined,
      logoUrl: logoUrl || undefined,
      pickupHint: asString(config.pickupHint) || undefined,
      loginPath: asString(config.loginPath) || undefined,
      navLinks: Array.isArray(config.navLinks)
        ? (config.navLinks as SiteConfig["config"]["navLinks"])
        : undefined,
      transmissionOptions: Array.isArray(config.transmissionOptions)
        ? (config.transmissionOptions as string[])
        : undefined,
      lessonDurations: Array.isArray(config.lessonDurations)
        ? (config.lessonDurations as string[])
        : undefined,
      lessonPackages: Array.isArray(config.lessonPackages)
        ? (config.lessonPackages as SiteConfig["config"]["lessonPackages"])
        : undefined,
      timeSlots: Array.isArray(config.timeSlots)
        ? (config.timeSlots as string[])
        : undefined,
      trustBadges: Array.isArray(config.trustBadges)
        ? (config.trustBadges as string[])
        : undefined,
    },
  };
}

export async function getSchoolByDomain(
  domain: string,
): Promise<SiteConfig | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || !domain) return null;

  try {
    const res = await fetch(`${apiUrl}/public/websites/${domain}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch school data: ${res.statusText}`);
    }

    return normalizeSiteConfig(await res.json());
  } catch (error) {
    console.error(`Error fetching data for domain ${domain}:`, error);
    return null;
  }
}

export function getDomainFromHost(host: string): string {
  const hostname = host.split(":")[0] || "";
  if (!hostname || hostname === "localhost") return "";

  const baseDomain =
    process.env.NEXT_PUBLIC_BASE_DOMAIN || "driveinstructor.pro";

  if (hostname === baseDomain || hostname === `preview.${baseDomain}`) {
    return "";
  }

  if (hostname.endsWith(`.${baseDomain}`)) {
    return hostname.slice(0, -(baseDomain.length + 1));
  }

  // Custom domains are looked up by full hostname.
  return hostname;
}

export function resolveSchoolLogoUrl(site: SiteConfig | null | undefined): string {
  if (!site) return "";
  return site.config?.logoUrl || site.logoUrl || "";
}

export function applySchoolBranding(
  data: SiteConfig,
  branding: Readonly<{ schoolName?: string; logoUrl?: string }>,
): SiteConfig {
  const schoolName = branding.schoolName?.trim() || data.schoolName;
  const logoUrl =
    branding.logoUrl?.trim() ||
    data.config?.logoUrl ||
    data.logoUrl ||
    undefined;

  return {
    ...data,
    schoolName,
    logoUrl,
    config: {
      ...data.config,
      logoUrl,
    },
  };
}
