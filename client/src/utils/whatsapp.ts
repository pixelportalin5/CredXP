import { siteConfig } from "@/config/site";

/**
 * Click-to-chat link in wa.me's documented format: digits-only number
 * (no "+", spaces or dashes) and a fully URL-encoded message.
 */
export function whatsappUrl(message?: string): string {
  const number = siteConfig.contact.whatsapp.replace(/\D/g, "");
  return message
    // encodeURIComponent leaves ' unescaped; some link checkers flag it.
    ? `https://wa.me/${number}?text=${encodeURIComponent(message).replace(/'/g, "%27")}`
    : `https://wa.me/${number}`;
}
