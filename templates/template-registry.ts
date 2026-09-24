import { ClassicTemplate } from "@/templates/ClassicTemplate";
import { FormEmbedTemplate } from "@/templates/FormEmbedTemplate";
import { ModernTemplate } from "@/templates/ModernTemplate";

export const TEMPLATE_REGISTRY = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  "form-embed": FormEmbedTemplate,
} as const;

export type TemplateKey = keyof typeof TEMPLATE_REGISTRY;
