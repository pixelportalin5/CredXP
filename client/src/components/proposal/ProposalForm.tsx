"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, Plus, Save, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { getProposalService } from "@/services/proposal.service";
import { getStaffPortalFromRole } from "@/utils/staffPortal";
import {
  buildDefaultPreparedFor,
  buildProposalPropertyEntry,
} from "@/utils/buildProposalDefaults";
import { buildDraftProposal, openProposalPreview, saveProposalDraft } from "@/utils/proposalDraftStorage";
import {
  DETAIL_FIELD_CONFIG,
  OVERVIEW_FIELD_CONFIG,
} from "@/constants/proposalDocument";
import type { Property } from "@/types/property";
import type { User } from "@/types/auth";
import type {
  PreparedFor,
  Proposal,
  ProposalCreatePayload,
  ProposalDetailFields,
  ProposalOverviewFields,
  ProposalPropertyEntry,
} from "@/types/proposal";

interface ProposalFormProps {
  user: User;
  backHref: string;
  /** Pool of properties the agent can add to this proposal (search/select list). */
  availableProperties: Property[];
  /** Pre-fills the first property when starting a proposal from a property's page. */
  initialProperty?: Property;
  /** Present when editing a previously saved proposal. */
  initialProposal?: Proposal;
  /** Where to send the agent after a successful save in edit mode. */
  onSaved?: (proposal: Proposal) => void;
}

function cloneEntry(entry: ProposalPropertyEntry): ProposalPropertyEntry {
  return {
    ...entry,
    overviewFields: entry.overviewFields ? { ...entry.overviewFields } : undefined,
    detailFields: entry.detailFields ? { ...entry.detailFields } : undefined,
    agentResearch: entry.agentResearch
      ? {
          pros: [...entry.agentResearch.pros] as [string, string, string],
          cons: [...entry.agentResearch.cons] as [string, string, string],
        }
      : { pros: ["", "", ""], cons: ["", "", ""] },
  };
}

function buildInitialEntries(initialProposal?: Proposal, initialProperty?: Property): ProposalPropertyEntry[] {
  if (initialProposal?.properties?.length) {
    return initialProposal.properties.map(cloneEntry);
  }
  if (initialProperty) {
    return [buildProposalPropertyEntry(initialProperty)];
  }
  return [];
}

export default function ProposalForm({
  user,
  backHref,
  availableProperties,
  initialProperty,
  initialProposal,
  onSaved,
}: ProposalFormProps) {
  const { showToast } = useToast();
  const portal = getStaffPortalFromRole(user.role) ?? "employee";
  const proposalService = getProposalService(portal);
  const isEditMode = Boolean(initialProposal);

  const [entries, setEntries] = useState<ProposalPropertyEntry[]>(() =>
    buildInitialEntries(initialProposal, initialProperty)
  );
  const [preparedFor, setPreparedFor] = useState<PreparedFor>(
    () => initialProposal?.preparedFor || buildDefaultPreparedFor()
  );
  const [savedProposal, setSavedProposal] = useState<Proposal | null>(initialProposal || null);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const previewOpenedRef = useRef(false);

  const draftKey = initialProperty?._id || initialProposal?._id || initialProposal?.propertyId || "draft";

  const selectedPropertyIds = useMemo(() => new Set(entries.map((entry) => entry.propertyId)), [entries]);

  const pickerResults = useMemo(() => {
    const query = pickerQuery.trim().toLowerCase();
    return availableProperties
      .filter((property) => !selectedPropertyIds.has(property._id))
      .filter((property) => {
        if (!query) return true;
        const haystack = `${property.title} ${property.location?.city || ""} ${property.location?.micromarket || ""}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 30);
  }, [availableProperties, pickerQuery, selectedPropertyIds]);

  const buildPayload = (): ProposalCreatePayload => ({
    preparedFor,
    properties: entries.map((entry) => ({
      propertyId: entry.propertyId,
      overviewFields: entry.overviewFields as ProposalOverviewFields,
      detailFields: entry.detailFields as ProposalDetailFields,
      agentResearch: entry.agentResearch,
    })),
  });

  const persist = async (): Promise<Proposal> => {
    if (!preparedFor.name.trim()) {
      throw new Error("Prepared For name is required.");
    }
    if (entries.length === 0) {
      throw new Error("Add at least one property to the proposal.");
    }

    const payload = buildPayload();
    const res = savedProposal
      ? await proposalService.update(savedProposal._id, payload)
      : await proposalService.create(payload);
    setSavedProposal(res.data);
    return res.data;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const proposal = await persist();
      showToast({
        type: "success",
        title: "Proposal saved",
        message: "Find it in your dashboard Proposals section.",
      });
      onSaved?.(proposal);
    } catch (error) {
      showToast({ type: "error", title: "Save failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const addProperty = (property: Property) => {
    setEntries((prev) => [...prev, buildProposalPropertyEntry(property)]);
    setPickerOpen(false);
    setPickerQuery("");
  };

  const removeProperty = (propertyId: string) => {
    setEntries((prev) => prev.filter((entry) => entry.propertyId !== propertyId));
  };

  const updateOverview = (propertyId: string, key: keyof ProposalOverviewFields, value: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.propertyId === propertyId
          ? { ...entry, overviewFields: { ...(entry.overviewFields as ProposalOverviewFields), [key]: value } }
          : entry
      )
    );
  };

  const updateDetail = (propertyId: string, key: keyof ProposalDetailFields, value: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.propertyId === propertyId
          ? { ...entry, detailFields: { ...(entry.detailFields as ProposalDetailFields), [key]: value } }
          : entry
      )
    );
  };

  const updateResearch = (propertyId: string, kind: "pros" | "cons", index: number, value: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.propertyId !== propertyId) return entry;
        const research = entry.agentResearch || { pros: ["", "", ""], cons: ["", "", ""] };
        const nextList = [...research[kind]] as [string, string, string];
        nextList[index] = value;
        return { ...entry, agentResearch: { ...research, [kind]: nextList } };
      })
    );
  };

  const handleOpenPreview = () => {
    const draft = buildDraftProposal(entries, user, preparedFor);
    const opened = openProposalPreview(draftKey, draft);
    if (!opened) {
      showToast({
        type: "info",
        title: "Pop-up blocked",
        message: "Allow pop-ups for this site to open live preview in a new tab.",
      });
    }
  };

  useEffect(() => {
    const draft = buildDraftProposal(entries, user, preparedFor);
    const timer = window.setTimeout(() => {
      saveProposalDraft(draftKey, draft);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draftKey, entries, preparedFor, user]);

  useEffect(() => {
    if (isEditMode) return;
    if (previewOpenedRef.current) return;
    previewOpenedRef.current = true;
    const draft = buildDraftProposal(entries, user, preparedFor);
    const opened = openProposalPreview(draftKey, draft);
    if (!opened) {
      showToast({
        type: "info",
        title: "Pop-up blocked",
        message: "Allow pop-ups for this site to open live preview in a new tab.",
      });
    }
    // Open preview tab once when the editor loads; draft sync keeps it updated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  const heading = isEditMode
    ? entries[0]?.propertyTitle || "Edit Proposal"
    : entries[0]?.propertyTitle || "New Proposal";

  return (
    <Container className="py-10 lg:py-14">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">
            {isEditMode ? "Edit Proposal" : "Create Proposal"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{heading}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {isEditMode
              ? "Update the details below and save to publish your changes."
              : "Edit in this tab — live preview opens in a new tab and updates as you type. Download or share the PDF from the preview tab."}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button size="md" variant="outline" icon={<ExternalLink className="h-4 w-4" />} onClick={handleOpenPreview}>
            {isEditMode ? "Preview" : "Live Preview"}
          </Button>
          <Button size="md" loading={saving} icon={<Save className="h-4 w-4" />} onClick={() => void handleSave()}>
            Save Proposal
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-accent-500">Properties in this Proposal</h2>
              <p className="mt-1 text-xs text-slate-500">
                Add one or more properties. Each property gets its own overview, details, and agent research.
              </p>
            </div>
            <div className="relative">
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setPickerOpen((open) => !open)}
              >
                Add Property
              </Button>
              {pickerOpen && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      value={pickerQuery}
                      onChange={(e) => setPickerQuery(e.target.value)}
                      placeholder="Search properties…"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-500/50"
                    />
                  </div>
                  <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
                    {pickerResults.length === 0 ? (
                      <p className="px-2 py-4 text-center text-xs text-slate-500">No matching properties.</p>
                    ) : (
                      pickerResults.map((property) => (
                        <button
                          key={property._id}
                          type="button"
                          onClick={() => addProperty(property)}
                          className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                        >
                          <span className="font-medium text-slate-900">{property.title}</span>
                          <span className="text-xs text-slate-500">
                            {[property.location?.micromarket, property.location?.city].filter(Boolean).join(", ")}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {entries.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No properties added yet. Use “Add Property” to get started.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {entries.map((entry) => (
                <span
                  key={entry.propertyId}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                >
                  {entry.propertyTitle}
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProperty(entry.propertyId)}
                      className="text-slate-400 transition-colors hover:text-red-600"
                      aria-label={`Remove ${entry.propertyTitle}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </section>

        {entries.map((entry, index) => (
          <div key={entry.propertyId} className="space-y-6">
            {entries.length > 1 && (
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Property {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{entry.propertyTitle}</h3>
              </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-accent-500">Property Overview</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {OVERVIEW_FIELD_CONFIG.map((field) => (
                  <Input
                    key={field.key}
                    label={field.label}
                    value={entry.overviewFields?.[field.key] ?? ""}
                    onChange={(e) => updateOverview(entry.propertyId, field.key, e.target.value)}
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
                          value={entry.detailFields?.[field.key] ?? ""}
                          onChange={(e) => updateDetail(entry.propertyId, field.key, e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-navy-100 outline-none transition-all duration-200 focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/15"
                        />
                      </div>
                    ) : (
                      <Input
                        label={field.label}
                        value={entry.detailFields?.[field.key] ?? ""}
                        onChange={(e) => updateDetail(entry.propertyId, field.key, e.target.value)}
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
                  {[0, 1, 2].map((i) => (
                    <Input
                      key={`pro-${i}`}
                      label={`Pro ${i + 1}`}
                      value={entry.agentResearch?.pros[i] ?? ""}
                      onChange={(e) => updateResearch(entry.propertyId, "pros", i, e.target.value)}
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Cons</p>
                  {[0, 1, 2].map((i) => (
                    <Input
                      key={`con-${i}`}
                      label={`Con ${i + 1}`}
                      value={entry.agentResearch?.cons[i] ?? ""}
                      onChange={(e) => updateResearch(entry.propertyId, "cons", i, e.target.value)}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        ))}
      </div>
    </Container>
  );
}
