"use client";

import { useEffect, useState } from "react";
import ProposalDocument from "@/components/proposal/ProposalDocument";
import type { Proposal } from "@/types/proposal";
import { generateAgentQrDataUrl } from "@/utils/proposalQrCode";

interface ProposalExportViewProps {
  proposal: Proposal;
}

/**
 * Chromium/Puppeteer render target — mirrors the live preview document only.
 */
export default function ProposalExportView({ proposal }: ProposalExportViewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.proposalPdfExport = "true";
    return () => {
      delete document.documentElement.dataset.proposalPdfExport;
    };
  }, []);

  useEffect(() => {
    let active = true;

    void generateAgentQrDataUrl(proposal.agent).then((url) => {
      if (!active) return;
      setQrDataUrl(url);
    });

    return () => {
      active = false;
    };
  }, [proposal.agent]);

  useEffect(() => {
    if (!qrDataUrl) return;

    const markReady = () => setReady(true);

    if (document.fonts?.ready) {
      void document.fonts.ready.then(markReady);
    } else {
      markReady();
    }
  }, [qrDataUrl]);

  if (!qrDataUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
        Preparing proposal…
      </div>
    );
  }

  return (
    <div className="bg-white" data-proposal-export-ready={ready ? "true" : "false"}>
      <ProposalDocument
        key={proposal.draftUpdatedAt ?? proposal.createdAt}
        proposal={proposal}
        qrDataUrl={qrDataUrl}
      />
    </div>
  );
}
