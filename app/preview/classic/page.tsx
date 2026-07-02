import { ClassicTemplate } from "@/templates/ClassicTemplate";

const mockClassicSite = {
  schoolName: "DriveRight Academy",
  logoUrl: "/schools/drive-right-logo.svg",
  googleRating: 4.9,
  googleReviewCount: 2400,
  templateName: "classic",
  config: {
    primaryColor: "#0f172a",
    welcomeText:
      "Learn to drive with confidence. Trusted instructors and flexible lesson times for every student.",
  },
};

export default function ClassicTemplatePreviewPage() {
  return <ClassicTemplate data={mockClassicSite} />;
}
