import { notFound } from "next/navigation";
import { ModernTemplate } from "@/templates/ModernTemplate";
import { ClassicTemplate } from "@/templates/ClassicTemplate";
import { getSchoolByDomain } from "@/lib/api";

const TEMPLATE_REGISTRY = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
} as const;

export default async function SchoolPublicSite({
  params,
}: Readonly<{
  params: Promise<{ domain: string }>;
}>) {
  const resolvedParams = await params;

  const siteData = await getSchoolByDomain(resolvedParams.domain);

  if (!siteData) {
    notFound();
  }

  type TemplateKey = keyof typeof TEMPLATE_REGISTRY;
  const TemplateComponent =
    TEMPLATE_REGISTRY[siteData.templateName as TemplateKey] ||
    TEMPLATE_REGISTRY.modern;

  return <TemplateComponent data={siteData} />;
}
