import axios from "axios";
import type { Proposal } from "@/types/proposal";
import type { StaffPortal } from "@/utils/staffPortal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("credxp_token") : null;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function requestProposalPdfBlob(
  portal: StaffPortal,
  payload: { proposal: Proposal } | { proposalId: string }
): Promise<Blob> {
  try {
    const response = await axios.post(`${API_BASE}/${portal}/proposals/pdf`, payload, {
      responseType: "blob",
      timeout: 120000,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    if (response.data.type === "application/json") {
      const text = await response.data.text();
      let message = "PDF generation failed.";
      try {
        const parsed = JSON.parse(text) as { message?: string };
        message = parsed.message || message;
      } catch {
        // keep default message
      }
      throw new Error(message);
    }

    return response.data as Blob;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("PDF generation timed out. Please try again.");
      }
      if (!error.response) {
        throw new Error(
          "Could not reach the API server. Restart the server (npm run dev in /server) and try again."
        );
      }
      if (error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const parsed = JSON.parse(text) as { message?: string };
          throw new Error(parsed.message || "PDF generation failed.");
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message !== "PDF generation failed.") {
            throw parseError;
          }
        }
      }
    }

    throw error instanceof Error ? error : new Error("PDF generation failed.");
  }
}

export function proposalPdfFilename(proposal: Proposal): string {
  const safeName = proposal.propertyTitle
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `CredXP-Proposal-${safeName || proposal._id}.pdf`;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadProposalPdf(proposal: Proposal, portal: StaffPortal): Promise<void> {
  const blob = await requestProposalPdfBlob(portal, { proposal });
  triggerBlobDownload(blob, proposalPdfFilename(proposal));
}

export type ShareProposalResult = "shared" | "downloaded";

export async function shareProposalPdf(
  proposal: Proposal,
  portal: StaffPortal
): Promise<ShareProposalResult> {
  const blob = await requestProposalPdfBlob(portal, { proposal });
  const filename = proposalPdfFilename(proposal);
  const file = new File([blob], filename, { type: "application/pdf" });

  const shareData: ShareData = {
    title: `CredXP Proposal — ${proposal.propertyTitle}`,
    text: `Property proposal: ${proposal.propertyTitle}`,
    files: [file],
  };

  if (typeof navigator !== "undefined" && "share" in navigator && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "shared";
      }
    }
  }

  triggerBlobDownload(blob, filename);
  return "downloaded";
}
