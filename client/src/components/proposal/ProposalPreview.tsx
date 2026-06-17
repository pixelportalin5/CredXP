"use client";

import { useEffect, useState } from "react";
import ProposalDocument from "@/components/proposal/ProposalDocument";
import ProposalPreviewToolbar from "@/components/proposal/ProposalPreviewToolbar";
import type { Proposal } from "@/types/proposal";
import { generateAgentQrDataUrl } from "@/utils/proposalQrCode";

interface ProposalPreviewProps {
  proposal: Proposal;
  variant?: "embedded" | "fullscreen";
}

export default function ProposalPreview({ proposal, variant = "embedded" }: ProposalPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>();

  useEffect(() => {
    let active = true;
    void generateAgentQrDataUrl(proposal.agent).then((url) => {
      if (active) setQrDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [proposal.agent]);

  if (variant === "fullscreen") {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="overflow-x-auto p-6">
          <ProposalDocument
            key={proposal.draftUpdatedAt ?? proposal.createdAt}
        proposal={proposal}
        qrDataUrl={qrDataUrl}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="max-h-[80vh] overflow-y-auto p-4">
        <ProposalDocument
          key={proposal.draftUpdatedAt ?? proposal.createdAt}
        proposal={proposal}
        qrDataUrl={qrDataUrl}
        />
      </div>
    </div>
  );
}

export function PublicProposalView({
  proposal,
  dashboardHref,
  showToolbar = false,
}: {
  proposal: Proposal;
  dashboardHref?: string;
  showToolbar?: boolean;
}) {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl px-4">
        {showToolbar && dashboardHref && (
          <ProposalPreviewToolbar proposal={proposal} dashboardHref={dashboardHref} />
        )}
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-accent-500">CredXP</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Property Proposal</h1>
          <p className="mt-2 text-sm text-slate-600">{proposal.propertyTitle}</p>
        </div>
        <ProposalPreview proposal={proposal} />
      </div>
    </div>
  );
}
