import type { Proposal, ProposalDetailFields, ProposalOverviewFields, ProposalPropertyEntry } from "@/types/proposal";
import { getSnapshotValue } from "@/utils/buildProposalDefaults";

function hasOverviewData(fields?: ProposalOverviewFields): boolean {
  if (!fields) return false;
  return Object.values(fields).some((value) => value?.trim());
}

function hasDetailData(fields?: ProposalDetailFields): boolean {
  if (!fields) return false;
  return Object.values(fields).some((value) => value?.trim());
}

function legacyOverviewFromSnapshot(entry: ProposalPropertyEntry): ProposalOverviewFields {
  const snapshot = entry.propertySnapshot;
  const city = getSnapshotValue(snapshot, "city");
  const state = getSnapshotValue(snapshot, "state");
  const micromarket = getSnapshotValue(snapshot, "micromarket");
  const location = [micromarket, city, state].filter(Boolean).join(", ");

  return {
    buildingName: getSnapshotValue(snapshot, "buildingName"),
    totalArea: getSnapshotValue(snapshot, "size"),
    numberOfLifts: "",
    numberOfFloors: getSnapshotValue(snapshot, "totalFloors"),
    location: location || getSnapshotValue(snapshot, "address"),
  };
}

function legacyDetailFromSnapshot(entry: ProposalPropertyEntry): ProposalDetailFields {
  const snapshot = entry.propertySnapshot;
  const rentPerSqft = getSnapshotValue(snapshot, "pricePerSqft");

  return {
    tenant: getSnapshotValue(snapshot, "tenantName"),
    aboutTenant: getSnapshotValue(snapshot, "tenantIndustry"),
    totalAreaLeased: getSnapshotValue(snapshot, "size"),
    exactAreaOffered: getSnapshotValue(snapshot, "size"),
    rentPerSqft: rentPerSqft ? `(${rentPerSqft})` : "",
    lockIn: getSnapshotValue(snapshot, "lockInPeriod"),
    leaseTenure: getSnapshotValue(snapshot, "leaseExpiry"),
    escalation: getSnapshotValue(snapshot, "escalation"),
    noticePeriod: "",
    rentCommencementDate: "",
    offeredRoi: getSnapshotValue(snapshot, "rentalYield"),
    expectedClosures: "",
  };
}

function resolveProposalPropertyEntry(entry: ProposalPropertyEntry): ProposalPropertyEntry {
  return {
    ...entry,
    overviewFields: hasOverviewData(entry.overviewFields)
      ? entry.overviewFields
      : legacyOverviewFromSnapshot(entry),
    detailFields: hasDetailData(entry.detailFields) ? entry.detailFields : legacyDetailFromSnapshot(entry),
  };
}

/** Resolves a proposal's properties (falling back to legacy snapshot-derived
 * fields when overview/detail data wasn't captured) and normalizes preparedFor. */
export function resolveProposalForDocument(proposal: Proposal): Proposal {
  const legacyEntry: ProposalPropertyEntry | undefined =
    !proposal.properties?.length && proposal.propertyId
      ? {
          propertyId: proposal.propertyId,
          propertyTitle: proposal.propertyTitle || "",
          propertyType: proposal.propertyType,
          propertySnapshot: proposal.propertySnapshot || [],
          coverImage: proposal.coverImage,
          overviewFields: proposal.overviewFields,
          detailFields: proposal.detailFields,
          agentResearch: proposal.agentResearch,
        }
      : undefined;

  const sourceProperties = proposal.properties?.length ? proposal.properties : legacyEntry ? [legacyEntry] : [];
  const properties = sourceProperties.map(resolveProposalPropertyEntry);
  const primary = properties[0];

  return {
    ...proposal,
    properties,
    propertyId: primary?.propertyId ?? proposal.propertyId,
    propertyTitle: primary?.propertyTitle ?? proposal.propertyTitle,
    propertyType: primary?.propertyType ?? proposal.propertyType,
    propertySnapshot: primary?.propertySnapshot ?? proposal.propertySnapshot,
    coverImage: primary?.coverImage ?? proposal.coverImage,
    overviewFields: primary?.overviewFields ?? proposal.overviewFields,
    detailFields: primary?.detailFields ?? proposal.detailFields,
    agentResearch: primary?.agentResearch ?? proposal.agentResearch,
    preparedFor: proposal.preparedFor?.name ? proposal.preparedFor : { name: "—", email: "", phone: "" },
  };
}
