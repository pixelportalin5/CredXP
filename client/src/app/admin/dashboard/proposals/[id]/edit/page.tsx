"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageLoader } from "@/components/ui/PageLoader";
import ProposalForm from "@/components/proposal/ProposalForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { getProposalService } from "@/services/proposal.service";
import propertyService from "@/services/property.service";
import { getDashboardPath, getStaffPortalFromPath } from "@/utils/staffPortal";
import { isAdmin } from "@/utils/roles";
import type { Property } from "@/types/property";
import type { Proposal } from "@/types/proposal";

export default function EditProposalPage() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const portal = getStaffPortalFromPath(pathname);
  const dashboardPath = getDashboardPath(portal);
  const dashboardHref = `${dashboardPath}?section=proposals`;
  const proposalService = getProposalService(portal);
  const { user, loading: authLoading } = useAuth();
  const hasPortalAccess = portal === "admin" ? isAdmin(user?.role) : user?.role === "employee";
  const { showToast } = useToast();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !hasPortalAccess || !id) return;

    async function fetchData() {
      try {
        setLoading(true);
        const [proposalRes, propertiesRes] = await Promise.all([
          proposalService.getById(id),
          propertyService.getAll({ limit: 500 }),
        ]);
        setProposal(proposalRes.data);
        setAvailableProperties(propertiesRes.data.properties || []);
      } catch (error) {
        setNotFound(true);
        showToast({
          type: "error",
          title: "Proposal unavailable",
          message: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasPortalAccess, id]);

  if (authLoading) {
    return <PageLoader label="Checking access…" />;
  }

  if (!user || !hasPortalAccess) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            {portal === "admin" ? "Admin access required" : "Employee access required"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Login with a {portal === "admin" ? "admin" : "employee"} account to edit proposals.
          </p>
          <Link href={`/login?next=${dashboardPath}`} className="mt-6 inline-block">
            <Button>Login</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  if (loading) return <PageLoader label="Loading proposal…" />;

  if (notFound || !proposal) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Proposal not found</h1>
          <p className="mt-2 text-sm text-slate-600">This proposal does not exist or has been removed.</p>
          <Link href={dashboardHref} className="mt-6 inline-block">
            <Button>Back to Proposals</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <ProposalForm
      user={user}
      backHref={dashboardHref}
      initialProposal={proposal}
      availableProperties={availableProperties}
    />
  );
}
