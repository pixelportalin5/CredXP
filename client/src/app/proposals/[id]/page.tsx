"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageLoader } from "@/components/ui/PageLoader";
import { PublicProposalView } from "@/components/proposal/ProposalPreview";
import { useAuth } from "@/components/providers/AuthProvider";
import proposalService from "@/services/proposal.service";
import { getProposalsDashboardHref } from "@/utils/staffPortal";
import { isStaff } from "@/utils/roles";
import type { Proposal } from "@/types/proposal";

export default function PublicProposalPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProposal() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await proposalService.getPublic(id);
        setProposal(res.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    void fetchProposal();
  }, [id]);

  if (loading) return <PageLoader label="Loading proposal…" />;

  if (error || !proposal) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Proposal not found</h1>
          <p className="mt-2 text-sm text-slate-600">This proposal link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const staffUser = user && isStaff(user.role);

  return (
    <PublicProposalView
      proposal={proposal}
      showToolbar={Boolean(staffUser)}
      dashboardHref={staffUser ? getProposalsDashboardHref(user.role) : undefined}
    />
  );
}
