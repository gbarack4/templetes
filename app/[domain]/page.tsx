import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSchoolByDomain } from "@/lib/api";
import {
  TEMPLATE_REGISTRY,
  type TemplateKey,
} from "@/templates/template-registry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ domain: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  const siteData = await getSchoolByDomain(domain);

  if (!siteData) {
    return {
      title: "School Not Found",
      description: "The driving school you are looking for does not exist.",
    };
  }

  const description =
    siteData.config?.seoDescription ||
    `Welcome to ${siteData.schoolName} - your best driving experience.`;

  const logoUrl = siteData.config?.logoUrl || "/default-og-image.jpg";

  return {
    title: `${siteData.schoolName} | Driving School`,
    description,
    openGraph: {
      title: siteData.schoolName,
      description,
      url: `https://${domain}`,
      siteName: siteData.schoolName,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: `${siteData.schoolName} logo`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteData.schoolName,
      description,
      images: [logoUrl],
    },
  };
}

export default async function SchoolPublicSite({ params }: Readonly<Props>) {
  const { domain } = await params;

  const siteData = await getSchoolByDomain(domain);

  if (!siteData) {
    notFound();
  }

  const TemplateComponent =
    TEMPLATE_REGISTRY[siteData.templateName as TemplateKey] ??
    TEMPLATE_REGISTRY.classic;

  return <TemplateComponent data={siteData} />;
}
