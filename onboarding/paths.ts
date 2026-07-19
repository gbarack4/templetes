const RESERVED_ROOTS = new Set(["login", "dashboard", "sign-up", "preview", "api"]);

export function getOnboardingBasePath(pathname: string): string {
  if (pathname === "/preview" || pathname.startsWith("/preview/")) {
    return "/preview/onboarding";
  }

  const root = pathname.split("/").filter(Boolean)[0];
  if (root && !RESERVED_ROOTS.has(root)) {
    return `/${root}/onboarding`;
  }

  return "/preview/onboarding";
}

export function buildOnboardingSearchPath(
  basePath: string,
  values: Readonly<{
    suburb: string;
    transmission: string;
    testDate?: string;
    lessonTime?: string;
    lessonDuration?: string;
    packageId?: string;
  }>,
): string {
  const params = new URLSearchParams({
    suburb: values.suburb.trim(),
    transmission: values.transmission,
  });

  if (values.testDate) {
    params.set("testDate", values.testDate);
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
  "transmission",
  "testDate",
  "lessonTime",
  "lessonDuration",
  "packageId",
] as const;

/** Keep Classic/search filters when moving through onboarding → book. */
export function withOnboardingQuery(
  path: string,
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): string {
  const params = new URLSearchParams();

  for (const key of BOOKING_QUERY_KEYS) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
