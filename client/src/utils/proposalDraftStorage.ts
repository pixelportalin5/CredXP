import { buildProposalPreview } from "@/utils/buildProposalSnapshot";
import type { Property } from "@/types/property";
import type { User } from "@/types/auth";
import type {
  AgentResearch,
  PreparedFor,
  Proposal,
  ProposalDetailFields,
  ProposalOverviewFields,
} from "@/types/proposal";

const STORAGE_PREFIX = "credxp-proposal-draft:";
const BROADCAST_CHANNEL = "credxp-proposal-draft";

function storageKey(propertyId: string): string {
  return `${STORAGE_PREFIX}${propertyId}`;
}

export function getPreviewWindowName(propertyId: string): string {
  return `credxp-proposal-preview-${propertyId}`;
}

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!broadcastChannel) broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);
  return broadcastChannel;
}

function notifyDraftUpdated(propertyId: string): void {
  getBroadcastChannel()?.postMessage({ propertyId, updatedAt: Date.now() });
}

export function buildDraftProposal(
  property: Property,
  user: User,
  preparedFor: PreparedFor,
  agentResearch: AgentResearch,
  overviewFields: ProposalOverviewFields,
  detailFields: ProposalDetailFields
): Proposal {
  const preview = buildProposalPreview(user, property);
  return {
    _id: "draft",
    propertyId: property._id,
    propertyTitle: property.title,
    propertyType: property.type,
    agent: preview.agent,
    propertySnapshot: preview.property,
    coverImage: property.coverImage || property.images?.[0],
    preparedFor,
    agentResearch,
    overviewFields,
    detailFields,
    createdAt: new Date().toISOString(),
  };
}

export function saveProposalDraft(propertyId: string, proposal: Proposal): void {
  if (typeof window === "undefined") return;
  const stamped: Proposal = { ...proposal, draftUpdatedAt: Date.now() };
  localStorage.setItem(storageKey(propertyId), JSON.stringify(stamped));
  notifyDraftUpdated(propertyId);
}

export function loadProposalDraft(propertyId: string): Proposal | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(storageKey(propertyId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Proposal;
  } catch {
    return null;
  }
}

export function subscribeToDraftUpdates(propertyId: string, onUpdate: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey(propertyId)) onUpdate();
  };

  const handleMessage = (event: MessageEvent<{ propertyId?: string }>) => {
    if (event.data?.propertyId === propertyId) onUpdate();
  };

  const handleFocus = () => onUpdate();
  const handleVisibility = () => {
    if (document.visibilityState === "visible") onUpdate();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener("focus", handleFocus);
  document.addEventListener("visibilitychange", handleVisibility);
  getBroadcastChannel()?.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("focus", handleFocus);
    document.removeEventListener("visibilitychange", handleVisibility);
    getBroadcastChannel()?.removeEventListener("message", handleMessage);
  };
}

export function getProposalPreviewUrl(propertyId: string): string {
  return `/properties/${propertyId}/proposal/preview`;
}

export function openProposalPreview(propertyId: string, proposal: Proposal): Window | null {
  saveProposalDraft(propertyId, proposal);
  const previewWindow = window.open(
    getProposalPreviewUrl(propertyId),
    getPreviewWindowName(propertyId)
  );
  previewWindow?.focus();
  return previewWindow;
}
