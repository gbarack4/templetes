import type { SiteConfig } from "@/templates/types";

export async function getSchoolByDomain(
  domain: string,
): Promise<SiteConfig | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${apiUrl}/public/websites/${domain}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch school data: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching data for domain ${domain}:`, error);
    return null;
  }
}
