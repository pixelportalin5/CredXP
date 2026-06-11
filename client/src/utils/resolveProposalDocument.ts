import type { Proposal, ProposalDetailFields, ProposalOverviewFields } from "@/types/proposal";
import { getSnapshotValue } from "@/utils/buildProposalDefaults";

function hasOverviewData(fields?: ProposalOverviewFields): boolean {
  if (!fields) return false;
  return Object.values(fields).some((value) => value?.trim());
}

function hasDetailData(fields?: ProposalDetailFields): boolean {
  if (!fields) return false;
  return Object.values(fields).some((value) => value?.trim());
}

function legacyOverviewFromSnapshot(proposal: Proposal): ProposalOverviewFields {
  const snapshot = proposal.propertySnapshot;
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

function legacyDetailFromSnapshot(proposal: Proposal): ProposalDetailFields {
  const snapshot = proposal.propertySnapshot;
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

export function resolveProposalForDocument(proposal: Proposal): Proposal {
  return {
    ...proposal,
    overviewFields: hasOverviewData(proposal.overviewFields)
      ? proposal.overviewFields
      : legacyOverviewFromSnapshot(proposal),
    detailFields: hasDetailData(proposal.detailFields)
      ? proposal.detailFields
      : legacyDetailFromSnapshot(proposal),
    preparedFor: proposal.preparedFor?.name
      ? proposal.preparedFor
      : { name: "—", email: "", phone: "" },
  };
}
