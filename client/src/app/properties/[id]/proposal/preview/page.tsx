"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import ProposalPreview from "@/components/proposal/ProposalPreview";
import ProposalPreviewToolbar from "@/components/proposal/ProposalPreviewToolbar";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAuth } from "@/components/providers/AuthProvider";
import { parseProposalDraft, readProposalDraftRaw, subscribeToDraftUpdates } from "@/utils/proposalDraftStorage";
import { getProposalsDashboardHref } from "@/utils/staffPortal";
import { isStaff } from "@/utils/roles";

export default function ProposalPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const canPreview = !authLoading && !!user && isStaff(user.role) && !!id;

  // Read the draft straight from localStorage as an external store; it re-reads on
  // storage/broadcast/focus events. `undefined` means "not read yet" (server render
  // and hydration), as opposed to `null` for "no draft saved".
  const subscribe = useCallback(
    (onChange: () => void) => (canPreview ? subscribeToDraftUpdates(id, onChange) : () => undefined),
    [canPreview, id]
  );
  const rawDraft = useSyncExternalStore<string | null | undefined>(
    subscribe,
    () => (id ? readProposalDraftRaw(id) : null),
    () => undefined
  );
  const proposal = useMemo(() => (rawDraft ? parseProposalDraft(rawDraft) : null), [rawDraft]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isStaff(user.role)) {
      router.replace(id ? `/properties/${id}` : "/invest");
      return;
    }
    if (id && rawDraft !== undefined && !proposal) {
      router.replace(`/properties/${id}/proposal`);
    }
  }, [authLoading, user, id, router, rawDraft, proposal]);

  const ready = canPreview && !!proposal;

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
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {proposal.propertyTitle}
            {(proposal.properties?.length || 0) > 1 && ` + ${proposal.properties.length - 1} more`}
          </h1>
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
