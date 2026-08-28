const RESERVED_ROOTS = new Set([
  "login",
  "dashboard",
  "sign-up",
  "preview",
  "api",
  "onboarding",
]);

function normalizeTransmission(transmission: string): string {
  const value = transmission.trim().toLowerCase();

  if (value === "auto") {
    return "automatic";
  }

  return value;
}

export function getOnboardingBasePath(pathname: string): string {
  if (pathname === "/preview" || pathname.startsWith("/preview/")) {
    return "/preview/onboarding";
  }

  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
    return "/onboarding";
  }

  const root = pathname.split("/").filter(Boolean)[0];

  if (root && !RESERVED_ROOTS.has(root)) {
    return `/${root}/onboarding`;
  }

  return "/onboarding";
}

export function buildOnboardingSearchPath(
  basePath: string,
  values: Readonly<{
    suburb: string;
    postcode?: string;
    transmission: string;
    preferredDate?: string;
    lessonTime?: string;
    lessonDuration?: string;
    packageId?: string;
  }>,
): string {
  const params = new URLSearchParams({
    suburb: values.suburb.trim(),
    transmission: normalizeTransmission(values.transmission),
  });

  if (values.postcode) {
    params.set("postcode", values.postcode.trim());
  }

  if (values.preferredDate) {
    params.set("preferredDate", values.preferredDate);
  }

  if (values.lessonTime) {
    params.set("lessonTime", values.lessonTime);
  }

  if (values.lessonDuration) {
    params.set("lessonDuration", values.lessonDuration);
  }

  if (values.packageId) {
    params.set("packageId", values.packageId);
  }

  return `${basePath}?${params.toString()}`;
}

const BOOKING_QUERY_KEYS = [
  "suburb",
  "postcode",
  "transmission",
  "preferredDate",
  "lessonTime",
  "lessonDuration",
  "packageId",
] as const;

/** Keep search filters when moving through onboarding → book. */
export function withOnboardingQuery(
  path: string,
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): string {
  const params = new URLSearchParams();

  for (const key of BOOKING_QUERY_KEYS) {
    const value = searchParams.get(key);

    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();

  return query ? `${path}?${query}` : path;
}
