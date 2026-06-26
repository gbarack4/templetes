import { notFound } from "next/navigation";
import { ModernTemplate } from "@/templates/ModernTemplate";
import { ClassicTemplate } from "@/templates/ClassicTemplate";
import type { SiteConfig } from "@/templates/types";

const TEMPLATE_REGISTRY = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
} as const;

async function fetchSchoolSiteConfig(
  domain: string,
): Promise<SiteConfig | null> {
  return {
    schoolName: "Demo Driving School",
    templateName: "modern",
    config: {
      welcomeText: `Welcome to the demo site for ${domain}`,
      primaryColor: "#3b82f6",
    },
  };
}

export default async function SchoolPublicSite({
  params,
}: Readonly<{
  params: Promise<{ domain: string }>;
}>) {
  const resolvedParams = await params;
  const siteData = await fetchSchoolSiteConfig(resolvedParams.domain);

  if (!siteData) {
    notFound();
  }

  type TemplateKey = keyof typeof TEMPLATE_REGISTRY;
  const TemplateComponent =
    TEMPLATE_REGISTRY[siteData.templateName as TemplateKey] ||
    TEMPLATE_REGISTRY.modern;

  return <TemplateComponent data={siteData} />;
}
