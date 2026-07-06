import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ModernTemplate } from "@/templates/ModernTemplate";
import { ClassicTemplate } from "@/templates/ClassicTemplate";
import { FormEmbedTemplate } from "@/templates/FormEmbedTemplate";
import { getSchoolByDomain } from "@/lib/api";

const TEMPLATE_REGISTRY = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  "form-embed": FormEmbedTemplate,
} as const;

type Props = {
  params: Promise<{ domain: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const siteData = await getSchoolByDomain(resolvedParams.domain);

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
    description: description,
    openGraph: {
      title: siteData.schoolName,
      description: description,
      url: `https://${resolvedParams.domain}`,
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
      description: description,
      images: [logoUrl],
    },
  };
}

export default async function SchoolPublicSite({ params }: Readonly<Props>) {
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
