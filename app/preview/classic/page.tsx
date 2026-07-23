import { ClassicTemplate } from "@/templates/ClassicTemplate";
import type { SiteConfig } from "@/templates/types";

const mockClassicSite: SiteConfig = {
  schoolName: "DriveRight Academy",
  logoUrl: "/schools/drive-right-logo.svg",
  templateName: "classic",
  googleRating: 4.9,
  googleReviewCount: 2400,
  config: {
    primaryColor: "#0f172a",
    logoUrl: "/schools/drive-right-logo.svg",
    welcomeText:
      "Learn to drive with confidence. Trusted instructors and flexible lesson times for every student.",
  },
};

export default function ClassicTemplatePreviewPage() {
  return <ClassicTemplate data={mockClassicSite} />;
}
