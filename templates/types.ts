export interface NavLink {
  label: string;
  href: string;
}

export interface LessonPackageOption {
  id: string;
  label: string;
}

export interface SiteConfig {
  schoolId?: string;
  schoolName: string;
  templateName: string;
  logoUrl?: string;
  googleRating?: number;
  googleReviewCount?: number;
  phoneNumber?: string;
  config: {
    primaryColor?: string;
    welcomeText?: string;
    seoDescription?: string;
    logoUrl?: string;
    pickupHint?: string;
    loginPath?: string;
    navLinks?: NavLink[];
    transmissionOptions?: string[];
    lessonDurations?: string[];
    lessonPackages?: LessonPackageOption[];
    timeSlots?: string[];
    trustBadges?: string[];
  };
}

export interface TemplateProps {
  data: SiteConfig;
}

export interface ModernBookingSearch {
  suburb: string;
  transmission: string;
  lessonDate: string;
  lessonTime: string;
  lessonDuration?: string;
  packageId?: string;
}
