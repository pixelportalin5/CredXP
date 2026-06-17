"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Proposal } from "@/types/proposal";
import {
  downloadProposalPdf,
  shareProposalPdf,
} from "@/services/proposalPdf.service";
import { getStaffPortalFromRole } from "@/utils/staffPortal";

interface ProposalPreviewToolbarProps {
  proposal: Proposal;
  dashboardHref: string;
  editHref?: string;
}

export default function ProposalPreviewToolbar({
  proposal,
  dashboardHref,
  editHref,
}: ProposalPreviewToolbarProps) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const portal = getStaffPortalFromRole(user?.role);

  const handleDownload = async () => {
    if (!portal) {
      showToast({ type: "error", title: "Download failed", message: "Staff access required." });
      return;
    }

    try {
      setDownloading(true);
      await downloadProposalPdf(proposal, portal);
      showToast({ type: "success", title: "PDF downloaded" });
    } catch (error) {
      showToast({
        type: "error",
        title: "Download failed",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!portal) {
      showToast({ type: "error", title: "Share failed", message: "Staff access required." });
      return;
    }

    try {
      setSharing(true);
      const result = await shareProposalPdf(proposal, portal);
      showToast({
        type: "success",
        title: result === "shared" ? "Shared" : "PDF downloaded",
        message:
          result === "shared"
            ? "Choose an app to send the proposal PDF."
            : "Your browser does not support file sharing — PDF saved instead.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Share failed",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={dashboardHref}>
          <Button size="sm" variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Proposals
          </Button>
        </Link>
        {editHref && (
          <Link href={editHref}>
            <Button size="sm" variant="outline">
              Edit Proposal
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          loading={downloading}
          icon={<Download className="h-4 w-4" />}
          onClick={() => void handleDownload()}
        >
          Download PDF
        </Button>
        <Button
          size="sm"
          variant="outline"
          loading={sharing}
          icon={<Share2 className="h-4 w-4" />}
          onClick={() => void handleShare()}
        >
          Share PDF
        </Button>
      </div>
    </div>
  );
}
