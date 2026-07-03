export interface SiteConfig {
  schoolName: string;
  templateName: string;
  config: {
    primaryColor?: string;
    welcomeText?: string;
    seoDescription?: string;
    logoUrl?: string;
  };
}

export interface TemplateProps {
  data: SiteConfig;
}
