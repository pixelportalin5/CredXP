"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Download, MessageCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import ProposalPreview from "@/components/proposal/ProposalPreview";
import { useToast } from "@/components/providers/ToastProvider";
import { getProposalService } from "@/services/proposal.service";
import { getStaffPortalFromRole } from "@/utils/staffPortal";
import { buildProposalPreview } from "@/utils/buildProposalSnapshot";
import { downloadProposalPdf } from "@/utils/generateProposalPdf";
import { shareProposalOnWhatsApp } from "@/utils/shareProposal";
import type { Property } from "@/types/property";
import type { User } from "@/types/auth";
import type { Proposal } from "@/types/proposal";

interface ProposalFormProps {
  property: Property;
  user: User;
  backHref: string;
}

export default function ProposalForm({ property, user, backHref }: ProposalFormProps) {
  const { showToast } = useToast();
  const preview = buildProposalPreview(user, property);
  const portal = getStaffPortalFromRole(user.role) ?? "employee";
  const proposalService = getProposalService(portal);
  const [savedProposal, setSavedProposal] = useState<Proposal | null>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const ensureSaved = async (): Promise<Proposal> => {
    if (savedProposal) return savedProposal;
    const res = await proposalService.create(property._id);
    setSavedProposal(res.data);
    return res.data;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const proposal = await ensureSaved();
      showToast({ type: "success", title: "Proposal saved", message: "Find it in your dashboard Proposals section." });
      return proposal;
    } catch (error) {
      showToast({ type: "error", title: "Save failed", message: error instanceof Error ? error.message : "Please try again." });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      setSaving(true);
      const proposal = await ensureSaved();
      await downloadProposalPdf(proposal);
      showToast({ type: "success", title: "PDF downloaded" });
    } catch (error) {
      showToast({ type: "error", title: "Download failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const proposal = await ensureSaved();
      const method = await shareProposalOnWhatsApp(proposal);
      showToast({
        type: "success",
        title: method === "native" ? "Shared" : "WhatsApp opened",
        message: method === "whatsapp-link" ? "Proposal link ready to send." : undefined,
      });
    } catch (error) {
      showToast({ type: "error", title: "Share failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setSharing(false);
    }
  };

  return (
    <Container className="py-10 lg:py-14">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to property
      </Link>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">Create Proposal</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{preview.propertyTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Review the proposal below, then save, download as PDF, or share on WhatsApp.</p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
          <Button size="md" loading={saving} icon={<Save className="h-4 w-4" />} onClick={() => void handleSave()}>
            Save Proposal
          </Button>
          <Button size="md" loading={saving} icon={<Download className="h-4 w-4" />} onClick={() => void handleDownload()}>
            Download PDF
          </Button>
          <Button size="md" loading={sharing} icon={<MessageCircle className="h-4 w-4" />} onClick={() => void handleShare()}>
            Share on WhatsApp
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <ProposalPreview propertyTitle={preview.propertyTitle} agent={preview.agent} fields={preview.property} />
      </div>
    </Container>
  );
}
