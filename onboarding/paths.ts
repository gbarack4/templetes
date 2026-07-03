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
