import type { SiteConfig } from "@/templates/types";

async function fetchSchoolConfig(
  path: string,
  source: string,
): Promise<SiteConfig | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${apiUrl}${path}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }

      throw new Error(`Failed to fetch school data: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching school data for ${source}:`, error);
    return null;
  }
}

export function getSchoolByDomain(domain: string): Promise<SiteConfig | null> {
  return fetchSchoolConfig(`/public/websites/${domain}`, `domain ${domain}`);
}

export function getSchoolByEmbedKey(
  embedKey: string,
): Promise<SiteConfig | null> {
  return fetchSchoolConfig(
    `/public/websites/embed/${embedKey}`,
    `embed key ${embedKey}`,
  );
}
