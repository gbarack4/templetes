import { insertCustomCode } from "./custom-code";
import type { Conversion, WebsiteIntegrations } from "./types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;   
  }
}

type State = {
  schoolId: string;
  config: WebsiteIntegrations;
  ready: boolean;
  sent: Set<string>;
};
let state: State | undefined;
const pending: Conversion[] = [];
const installed = new Set<string>();
const idPattern = /^[A-Za-z0-9_-]{1,50}$/;

function isPreview() {
  return /^\/preview(?:\/|$)/.test(window.location.pathname);
}

export async function initializeTracking(
  schoolId: string,
  config?: WebsiteIntegrations,
) {
  if (typeof window === "undefined") return;
  if (isPreview()) {
    if (state) window.location.reload();
    return;
  }
  if (!schoolId) return;
  if (state) {    
    if (state.schoolId !== schoolId) window.location.reload();
    return;
  }
  state = {
    schoolId,
    config: config ?? {
      googleAds: null,
      googleTagManager: null,
      customCode: [],
    },
    ready: false,
    sent: new Set(),
  }; 
  
  await insertCustomCode(state.config.customCode ?? [], installed);
  initializeGoogle(state.config);
  state.ready = true;
  const queued = pending.splice(0);
  for (const event of queued) trackConversion(event);
}

function appendGoogleScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.append(script);
}

function initializeGoogle(config: WebsiteIntegrations) {
  const gtm = config.googleTagManager?.containerId;
  const ads = config.googleAds?.conversionId;
  if (gtm && /^GTM-[A-Z0-9]{1,28}$/.test(gtm)) {
    window.dataLayer ??= [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    appendGoogleScript(
      "school-gtm",
      `https://www.googletagmanager.com/gtm.js?id=${gtm}`,
    );
  }
  if (ads && /^AW-\d{1,29}$/.test(ads)) {
    window.dataLayer ??= [];    
    window.gtag ??= function () {     
      // Preserve Google's documented gtag command format.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ads);
    appendGoogleScript(
      "school-google-ads",
      `https://www.googletagmanager.com/gtag/js?id=${ads}`,
    );
  }
}

function once(key: string, send: () => void) {
  if (!state || state.sent.has(key)) return;
  const storageKey = `website-conversion:${state.schoolId}:${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
  } catch {
    /* Private browsing. */
  }
  send();
  state.sent.add(key);
  try {
    sessionStorage.setItem(storageKey, "1");
  } catch {
    /* Memory still deduplicates. */
  }
}

function sendConversion(event: Conversion, config: WebsiteIntegrations) {
  const payload: Record<string, string | number> = {
    school_id: event.schoolId,
    transaction_id: event.transactionId,
    event_id: event.id,
  };
  if (
    Number.isFinite(event.value) &&
    event.value! >= 0 &&
    /^[A-Za-z]{3}$/.test(event.currency ?? "")
  ) {
    payload.value = event.value!;
    payload.currency = event.currency!.toUpperCase();
  }
  const gtm = config.googleTagManager?.containerId;
  if (gtm && /^GTM-[A-Z0-9]{1,28}$/.test(gtm)) {
    once(`gtm:${gtm}:${event.event}:${event.id}`, () => {
      window.dataLayer!.push({
        value: null,
        currency: null,
        ...payload,
        event: event.event,
      });
    });
  }
  const ads = config.googleAds;
  if (!ads || !/^AW-\d{1,29}$/.test(ads.conversionId)) return;
  const labels = {
    booking_confirmed: ads.bookingConversionLabel,
    package_purchased: ads.purchaseConversionLabel,
    enquiry_submitted: ads.enquiryConversionLabel,
  };
  const label = labels[event.event];
  if (!/^[A-Za-z0-9_-]{1,200}$/.test(label ?? "")) return;
  const destination = `${ads.conversionId}/${label}`; 
  once(`ads:${destination}:${event.transactionId}`, () => {
    window.gtag?.("event", "conversion", { ...payload, send_to: destination });
  });
}

export function trackConversion(event: Conversion): void {
  try {
    if (
      typeof window === "undefined" ||
      isPreview() ||
      !idPattern.test(event.id)
    )
      return;
    if (!event.transactionId || event.transactionId.length > 64) return;
    if (!state?.ready) {
      if (pending.length < 100) pending.push(event);
      return;
    }
    if (event.schoolId !== state.schoolId) return;
    sendConversion(event, state.config);
  } catch {
    // Tracking must never interrupt booking, payment or enquiry confirmation.
  }
}

export function trackConfirmedBooking(
  schoolId: string,
  bookingId: string,
  purchaseId?: string,
) {
  const transactionId = purchaseId
    ? `purchase:${purchaseId}`
    : `booking:${bookingId}`;
  trackConversion({
    schoolId,
    event: "booking_confirmed",
    id: bookingId,
    transactionId,
  });
  if (purchaseId) trackPackagePurchase(schoolId, purchaseId);
}

export function trackPackagePurchase(
  schoolId: string,
  purchaseId: string,
  amount?: string,
  currency?: string,
) {
  trackConversion({
    schoolId,
    event: "package_purchased",
    id: purchaseId,
    transactionId: `purchase:${purchaseId}`,
    value: amount ? Number(amount) : undefined,
    currency,
  });
}
