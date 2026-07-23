import {
  mockModernLessonDurations,
  mockModernLessonPackages,
  mockModernNavLinks,
  mockModernTrustBadges,
  mockModernTransmissionOptions,
} from "@/templates/resolve-modern-site";
import { mockRescheduleTimeSlots } from "@/dashboard/mock-data";

export const mockModernSiteConfig = {
  schoolName: "DriveRight Academy",
  logoUrl: "/schools/drive-right-logo.svg",
  phoneNumber: "+15551234567",
  templateName: "modern",
  config: {
    primaryColor: "#2563eb",
    welcomeText:
      "Welcome to our driving school! Book lessons online and learn with certified instructors.",
    pickupHint: "We'll use this to find instructors near you.",
    loginPath: "/login",
    logoUrl: "/schools/drive-right-logo.svg",
    navLinks: [...mockModernNavLinks],
    transmissionOptions: [...mockModernTransmissionOptions],
    lessonDurations: [...mockModernLessonDurations],
    lessonPackages: [...mockModernLessonPackages],
    timeSlots: [...mockRescheduleTimeSlots],
    trustBadges: [...mockModernTrustBadges],
  },
};
