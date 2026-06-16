"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, ExternalLink, MessageCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { getProposalService } from "@/services/proposal.service";
import { getStaffPortalFromRole } from "@/utils/staffPortal";
import {
  buildDefaultAgentResearch,
  buildDefaultDetailFields,
  buildDefaultOverviewFields,
  buildDefaultPreparedFor,
} from "@/utils/buildProposalDefaults";
import { downloadProposalPdf } from "@/utils/generateProposalPdf";
import { buildDraftProposal, openProposalPreview, saveProposalDraft } from "@/utils/proposalDraftStorage";
import { shareProposalOnWhatsApp } from "@/utils/shareProposal";
import {
  DETAIL_FIELD_CONFIG,
  OVERVIEW_FIELD_CONFIG,
} from "@/constants/proposalDocument";
import type { Property } from "@/types/property";
import type { User } from "@/types/auth";
import type {
  AgentResearch,
  PreparedFor,
  Proposal,
  ProposalCreatePayload,
  ProposalDetailFields,
  ProposalOverviewFields,
} from "@/types/proposal";

interface ProposalFormProps {
  property: Property;
  user: User;
  backHref: string;
}

export default function ProposalForm({ property, user, backHref }: ProposalFormProps) {
  const { showToast } = useToast();
  const portal = getStaffPortalFromRole(user.role) ?? "employee";
  const proposalService = getProposalService(portal);

  const [preparedFor, setPreparedFor] = useState<PreparedFor>(buildDefaultPreparedFor);
  const [agentResearch, setAgentResearch] = useState<AgentResearch>(buildDefaultAgentResearch);
  const [overviewFields, setOverviewFields] = useState<ProposalOverviewFields>(() =>
    buildDefaultOverviewFields(property)
  );
  const [detailFields, setDetailFields] = useState<ProposalDetailFields>(() =>
    buildDefaultDetailFields(property)
  );

  const [savedProposal, setSavedProposal] = useState<Proposal | null>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const buildPayload = (): ProposalCreatePayload => ({
    propertyId: property._id,
    preparedFor,
    agentResearch,
    overviewFields,
    detailFields,
  });

  const ensureSaved = async (): Promise<Proposal> => {
    if (savedProposal) return savedProposal;
    if (!preparedFor.name.trim()) {
      throw new Error("Prepared For name is required.");
    }
    const res = await proposalService.create(buildPayload());
    setSavedProposal(res.data);
    return res.data;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await ensureSaved();
      showToast({ type: "success", title: "Proposal saved", message: "Find it in your dashboard Proposals section." });
    } catch (error) {
      showToast({ type: "error", title: "Save failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      setSaving(true);
      const proposal = await ensureSaved();
      await downloadProposalPdf(proposal, {
        coverImageFallback: property.coverImage || property.images?.[0],
      });
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
      await shareProposalOnWhatsApp(proposal, {
        coverImageFallback: property.coverImage || property.images?.[0],
      });
      showToast({
        type: "success",
        title: "WhatsApp opened",
        message: "PDF downloaded — attach it in the WhatsApp chat if needed.",
      });
    } catch (error) {
      showToast({ type: "error", title: "Share failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setSharing(false);
    }
  };

  const updateOverview = (key: keyof ProposalOverviewFields, value: string) => {
    setOverviewFields((prev) => ({ ...prev, [key]: value }));
  };

  const updateDetail = (key: keyof ProposalDetailFields, value: string) => {
    setDetailFields((prev) => ({ ...prev, [key]: value }));
  };

  const updatePro = (index: number, value: string) => {
    setAgentResearch((prev) => {
      const pros = [...prev.pros] as [string, string, string];
      pros[index] = value;
      return { ...prev, pros };
    });
  };

  const updateCon = (index: number, value: string) => {
    setAgentResearch((prev) => {
      const cons = [...prev.cons] as [string, string, string];
      cons[index] = value;
      return { ...prev, cons };
    });
  };

  const handleOpenPreview = () => {
    const draft = buildDraftProposal(
      property,
      user,
      preparedFor,
      agentResearch,
      overviewFields,
      detailFields
    );
    openProposalPreview(property._id, draft);
  };

  useEffect(() => {
    const draft = buildDraftProposal(
      property,
      user,
      preparedFor,
      agentResearch,
      overviewFields,
      detailFields
    );
    const timer = window.setTimeout(() => {
      saveProposalDraft(property._id, draft);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [property, user, preparedFor, agentResearch, overviewFields, detailFields]);

  return (
    <Container className="py-10 lg:py-14">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to property
      </Link>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">Create Proposal</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{property.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Edit proposal details below, then save, download as PDF, or share on WhatsApp.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
          <Button size="md" variant="outline" icon={<ExternalLink className="h-4 w-4" />} onClick={handleOpenPreview}>
            Live Preview
          </Button>
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

      <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-accent-500">Prepared For</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                label="Client Name *"
                value={preparedFor.name}
                onChange={(e) => setPreparedFor((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                value={preparedFor.email || ""}
                onChange={(e) => setPreparedFor((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                label="Phone"
                value={preparedFor.phone || ""}
                onChange={(e) => setPreparedFor((prev) => ({ ...prev, phone: e.target.value }))}
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-accent-500">Property Overview</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {OVERVIEW_FIELD_CONFIG.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  value={overviewFields[field.key]}
                  onChange={(e) => updateOverview(field.key, e.target.value)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-accent-500">Property Details</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DETAIL_FIELD_CONFIG.map((field) => (
                <div key={field.key} className={field.multiline ? "sm:col-span-2" : ""}>
                  {field.multiline ? (
                    <div className="w-full">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400">
                        {field.label}
                      </label>
                      <textarea
                        value={detailFields[field.key]}
                        onChange={(e) => updateDetail(field.key, e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-navy-100 outline-none transition-all duration-200 focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/15"
                      />
                    </div>
                  ) : (
                    <Input
                      label={field.label}
                      value={detailFields[field.key]}
                      onChange={(e) => updateDetail(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-accent-500">Agent Research</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">Pros</p>
                {[0, 1, 2].map((index) => (
                  <Input
                    key={`pro-${index}`}
                    label={`Pro ${index + 1}`}
                    value={agentResearch.pros[index]}
                    onChange={(e) => updatePro(index, e.target.value)}
                  />
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Cons</p>
                {[0, 1, 2].map((index) => (
                  <Input
                    key={`con-${index}`}
                    label={`Con ${index + 1}`}
                    value={agentResearch.cons[index]}
                    onChange={(e) => updateCon(index, e.target.value)}
                  />
                ))}
              </div>
            </div>
          </section>
      </div>
    </Container>
  );
}
