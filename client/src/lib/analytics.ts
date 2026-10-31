/**
 * GA4 event helper. Does nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID is set
 * and the gtag script has loaded.
 *
 * Conversion to mark in GA4: generate_lead (a submitted enquiry form).
 * click_call / click_whatsapp are micro-conversions, not leads.
 */
type GtagFn = (command: "event", name: string, params?: Record<string, unknown>) => void;

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", name, { page_path: window.location.pathname, ...params });
}
