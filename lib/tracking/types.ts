export type WebsiteIntegrations = {
  googleAds: {
    conversionId: string;
    bookingConversionLabel: string;
    purchaseConversionLabel: string;
    enquiryConversionLabel: string;
  } | null;
  googleTagManager: { containerId: string } | null;
  customCode: {
    id: string;
    code: string;
    placement: "head" | "body_start" | "body_end";
    sortOrder: number;
  }[];
};

export type Conversion = {
  schoolId: string;
  event: "booking_confirmed" | "package_purchased" | "enquiry_submitted";
  id: string;
  transactionId: string;
  value?: number;
  currency?: string;
};
