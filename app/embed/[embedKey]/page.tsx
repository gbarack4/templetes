import { notFound } from "next/navigation";

import { getSchoolByEmbedKey } from "@/lib/api";
import {
  TEMPLATE_REGISTRY,
  type TemplateKey,
} from "@/templates/template-registry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ embedKey: string }>;
};

export default async function EmbeddedSchoolSite({ params }: Readonly<Props>) {
  const { embedKey } = await params;

  const siteData = await getSchoolByEmbedKey(embedKey);

  if (!siteData) {
    notFound();
  }

  const TemplateComponent =
    TEMPLATE_REGISTRY[siteData.templateName as TemplateKey] ??
    TEMPLATE_REGISTRY.classic;

  return <TemplateComponent data={siteData} />;
}
