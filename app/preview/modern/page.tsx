import { ModernTemplate } from "@/templates/ModernTemplate";
import { mockModernSiteConfig } from "@/templates/mock-modern-site";

export default function ModernTemplatePreviewPage() {
  return <ModernTemplate data={mockModernSiteConfig} />;
}
