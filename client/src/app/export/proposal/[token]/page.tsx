import { notFound } from "next/navigation";
import ProposalExportView from "@/components/proposal/ProposalExportView";
import type { Proposal } from "@/types/proposal";

async function fetchExportProposal(token: string): Promise<Proposal | null> {
  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  const secret = process.env.PDF_EXPORT_SECRET;
  if (!secret) {
    console.error("[export/proposal] PDF_EXPORT_SECRET is not configured.");
    return null;
  }

  const response = await fetch(`${apiBase.replace(/\/$/, "")}/proposals/export/${token}`, {
    headers: {
      "x-pdf-export-secret": secret,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { data?: Proposal };
  return payload.data ?? null;
}

export default async function ExportProposalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const proposal = await fetchExportProposal(token);

  if (!proposal) {
    notFound();
  }

  return <ProposalExportView proposal={proposal} />;
}
