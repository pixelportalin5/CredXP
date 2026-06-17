"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProposalPreview from "@/components/proposal/ProposalPreview";
import ProposalPreviewToolbar from "@/components/proposal/ProposalPreviewToolbar";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAuth } from "@/components/providers/AuthProvider";
import { loadProposalDraft, subscribeToDraftUpdates } from "@/utils/proposalDraftStorage";
import { getProposalsDashboardHref } from "@/utils/staffPortal";
import { isStaff } from "@/utils/roles";
import type { Proposal } from "@/types/proposal";

export default function ProposalPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [ready, setReady] = useState(false);

  const refreshDraft = useCallback(() => {
    if (!id) return;
    const draft = loadProposalDraft(id);
    if (draft) setProposal(draft);
  }, [id]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isStaff(user.role)) {
      router.replace(id ? `/properties/${id}` : "/invest");
      return;
    }
    if (!id) return;

    const draft = loadProposalDraft(id);
    if (!draft) {
      router.replace(`/properties/${id}/proposal`);
      return;
    }

    setProposal(draft);
    setReady(true);
  }, [authLoading, user, id, router]);

  useEffect(() => {
    if (!ready || !id) return;
    return subscribeToDraftUpdates(id, refreshDraft);
  }, [ready, id, refreshDraft]);

  if (authLoading || !ready || !proposal) return <PageLoader label="Loading preview…" />;
  if (!user || !isStaff(user.role)) return null;

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl px-4">
        <ProposalPreviewToolbar
          proposal={proposal}
          dashboardHref={getProposalsDashboardHref(user.role)}
          editHref={`/properties/${id}/proposal`}
        />

        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">Live Preview</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{proposal.propertyTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Updates automatically as you edit the proposal form in the other tab.
          </p>
        </div>

        <ProposalPreview
          key={proposal.draftUpdatedAt ?? proposal.createdAt}
          proposal={proposal}
          variant="fullscreen"
        />
      </div>
    </div>
  );
}
