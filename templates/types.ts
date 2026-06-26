export interface SiteConfig {
  schoolName: string;
  templateName: string;
  config: {
    primaryColor?: string;
    welcomeText?: string;
  };
}

export interface TemplateProps {
  data: SiteConfig;
}
