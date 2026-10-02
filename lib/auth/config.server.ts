import "server-only";
import type { StudentAuthConfig } from "./types";

export async function loadStudentAuthConfig(
  schoolId: string,
  lookup: { domain: string } | { embedKey: string },
): Promise<{ authConfig: StudentAuthConfig | null; authError: string | null }> {
  try {
    const suffix =
      "domain" in lookup
        ? `domain/${encodeURIComponent(lookup.domain)}`
        : `embed/${encodeURIComponent(lookup.embedKey)}`;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/websites/auth-config/${suffix}`,
      { cache: "no-store" },
    );
    if (!response.ok) throw new Error("Unavailable configuration");
    const data: unknown = await response.json();
    if (
      !data ||
      typeof data !== "object" ||
      !("schoolId" in data) ||
      data.schoolId !== schoolId ||
      !("region" in data) ||
      typeof data.region !== "string" ||
      !("userPoolId" in data) ||
      typeof data.userPoolId !== "string" ||
      !("clientId" in data) ||
      typeof data.clientId !== "string" ||
      !data.clientId ||
      !("issuer" in data) ||
      data.issuer !==
        `https://cognito-idp.${data.region}.amazonaws.com/${data.userPoolId}`
    ) {
      throw new Error("Invalid configuration");
    }
    return {
      authConfig: {
        schoolId,
        region: data.region,
        userPoolId: data.userPoolId,
        clientId: data.clientId,
        issuer: data.issuer,
      },
      authError: null,
    };
  } catch {
    return {
      authConfig: null,
      authError:
        "Sign-in is temporarily unavailable for this school. Please try again later.",
    };
  }
}
