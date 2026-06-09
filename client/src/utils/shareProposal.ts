import { siteConfig } from "@/config/site";
import type { Proposal } from "@/types/proposal";
import { getProposalPdfFile } from "@/utils/generateProposalPdf";

export function getProposalPublicUrl(proposalId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/proposals/${proposalId}`;
  }
  return `${siteConfig.url}/proposals/${proposalId}`;
}

export function getProposalShareMessage(proposal: Proposal): string {
  return `CredXP Property Proposal: ${proposal.propertyTitle}\n\nView full details: ${getProposalPublicUrl(proposal._id)}`;
}

export async function shareProposalOnWhatsApp(proposal: Proposal): Promise<"native" | "whatsapp-link"> {
  const message = getProposalShareMessage(proposal);
  const pdfFile = await getProposalPdfFile(proposal);

  if (typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator) {
    try {
      const shareData: ShareData = { title: `CredXP Proposal — ${proposal.propertyTitle}`, text: message, files: [pdfFile] };
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return "native";
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "native";
      }
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  return "whatsapp-link";
}
