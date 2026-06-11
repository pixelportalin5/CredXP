import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { Proposal } from "@/types/proposal";
import { prepareHtml2CanvasClone, prepareHtml2CanvasElement } from "@/utils/html2canvasSafeClone";
import { prepareProposalForPdf } from "@/utils/prepareProposalForPdf";
import { A4_HEIGHT_PX, A4_WIDTH_PX, mountProposalDocument } from "@/utils/renderProposalDocument";

export { toSafeCurrency } from "@/utils/pdfFormat";

const PDF_WIDTH_PT = 595.28;
const PDF_HEIGHT_PT = 841.89;

export async function generateProposalPdf(proposal: Proposal): Promise<jsPDF> {
  const exportProposal = await prepareProposalForPdf(proposal);
  const { container, unmount } = await mountProposalDocument(exportProposal);

  try {
    // html2canvas parses the live element tree first — inline RGB and drop Tailwind classes.
    prepareHtml2CanvasElement(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      windowWidth: A4_WIDTH_PX,
      windowHeight: A4_HEIGHT_PX,
      onclone: (clonedDoc, clonedRoot) => {
        prepareHtml2CanvasClone(container, clonedDoc, clonedRoot as HTMLElement);
      },
    });

    const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const imageData = canvas.toDataURL("image/jpeg", 0.92);
    doc.addImage(imageData, "JPEG", 0, 0, PDF_WIDTH_PT, PDF_HEIGHT_PT);
    return doc;
  } catch (error) {
    throw error;
  } finally {
    unmount();
  }
}

export async function downloadProposalPdf(proposal: Proposal) {
  const doc = await generateProposalPdf(proposal);
  const safeName = proposal.propertyTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  doc.save(`CredXP-Proposal-${safeName || proposal._id}.pdf`);
}

export async function getProposalPdfBlob(proposal: Proposal): Promise<Blob> {
  const doc = await generateProposalPdf(proposal);
  return doc.output("blob");
}

export async function getProposalPdfFile(proposal: Proposal): Promise<File> {
  const blob = await getProposalPdfBlob(proposal);
  const safeName = proposal.propertyTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  return new File([blob], `CredXP-Proposal-${safeName || proposal._id}.pdf`, { type: "application/pdf" });
}
