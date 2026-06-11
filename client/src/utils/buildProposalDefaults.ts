import { emptyAgentResearch, emptyDetailFields, emptyOverviewFields } from "@/constants/proposalDocument";
import type { AgentResearch, PreparedFor, ProposalDetailFields, ProposalOverviewFields } from "@/types/proposal";
import type { Property } from "@/types/property";
import { formatPricePerSqft, formatSize, formatYield } from "@/utils/format";

function formatLocation(property: Property): string {
  const parts = [
    property.location?.micromarket,
    property.location?.city,
    property.location?.state,
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return [property.location?.address, property.location?.city].filter(Boolean).join(", ");
}

export function buildDefaultOverviewFields(property: Property): ProposalOverviewFields {
  const unit = property.specs?.sizeUnit || "sqft";
  return {
    buildingName: property.buildingName || "",
    totalArea: property.size ? formatSize(property.size, unit) : "",
    numberOfLifts: "",
    numberOfFloors: property.specs?.totalFloors ? String(property.specs.totalFloors) : "",
    location: formatLocation(property),
  };
}

export function buildDefaultDetailFields(property: Property): ProposalDetailFields {
  const unit = property.specs?.sizeUnit || "sqft";
  const rentPerSqft =
    property.price && property.size ? formatPricePerSqft(property.price, property.size) : "";

  return {
    tenant: property.tenant?.name || "",
    aboutTenant: property.tenant?.industry ? `${property.tenant.industry}` : "",
    totalAreaLeased: property.size ? formatSize(property.size, unit) : "",
    exactAreaOffered: property.size ? formatSize(property.size, unit) : "",
    rentPerSqft: rentPerSqft ? `(${rentPerSqft})` : "",
    lockIn: property.tenant?.lockInPeriod || "",
    leaseTenure: property.tenant?.leaseExpiry || "",
    escalation: property.financials?.escalation || "",
    noticePeriod: "",
    rentCommencementDate: "",
    offeredRoi: property.financials?.rentalYield ? formatYield(property.financials.rentalYield) : "",
    expectedClosures: "",
  };
}

export function buildDefaultPreparedFor(): PreparedFor {
  return { name: "", email: "", phone: "" };
}

export function buildDefaultAgentResearch(): AgentResearch {
  return emptyAgentResearch();
}

export function getSnapshotValue(
  snapshot: Array<{ key: string; value: string }>,
  key: string
): string {
  return snapshot.find((field) => field.key === key)?.value || "";
}
