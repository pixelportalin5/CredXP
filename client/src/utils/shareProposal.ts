import { siteConfig } from "@/config/site";
import type { Proposal } from "@/types/proposal";
import { downloadProposalPdf } from "@/utils/generateProposalPdf";

export const WHATSAPP_FOLLOWUP_KEY = "credxp:whatsapp-followup";

export function markWhatsAppFollowupVisible() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(WHATSAPP_FOLLOWUP_KEY, "1");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("credxp:whatsapp-followup"));
  }
}

export function isWhatsAppFollowupVisible(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(WHATSAPP_FOLLOWUP_KEY) === "1";
}

export function getProposalPublicUrl(proposalId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/proposals/${proposalId}`;
  }
  return `${siteConfig.url}/proposals/${proposalId}`;
}

export function getProposalShareMessage(proposal: Proposal): string {
  return `CredXP Property Proposal: ${proposal.propertyTitle}\n\nView online: ${getProposalPublicUrl(proposal._id)}\n\n(Please attach the downloaded PDF if sharing via WhatsApp.)`;
}

function whatsAppShareUrl(message: string): string {
  const phone = siteConfig.contact.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Download PDF, open WhatsApp with pre-filled message, enable follow-up floating button. */
export async function shareProposalOnWhatsApp(
  proposal: Proposal,
  options?: { coverImageFallback?: string }
): Promise<"whatsapp"> {
  const message = getProposalShareMessage(proposal);

  await downloadProposalPdf(proposal, options);

  if (typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator) {
    try {
      const { getProposalPdfFile } = await import("@/utils/generateProposalPdf");
      const pdfFile = await getProposalPdfFile(proposal, options);
      const shareData: ShareData = {
        title: `CredXP Proposal — ${proposal.propertyTitle}`,
        text: message,
        files: [pdfFile],
      };
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        markWhatsAppFollowupVisible();
        return "whatsapp";
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        markWhatsAppFollowupVisible();
        return "whatsapp";
      }
    }
  }

  window.open(whatsAppShareUrl(message), "_blank", "noopener,noreferrer");
  markWhatsAppFollowupVisible();
  return "whatsapp";
}
