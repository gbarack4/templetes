import { FormEmbedTemplate } from "@/templates/FormEmbedTemplate";

const mockFormEmbedSite = {
  schoolName: "DriveCab School",
  logoUrl: "/schools/drive-right-logo.svg",
  templateName: "form-embed",
  config: {
    transmissionOptions: ["Auto", "Manual"],
  },
};

export default function FormEmbedTemplatePreviewPage() {
  return <FormEmbedTemplate data={mockFormEmbedSite} />;
}
