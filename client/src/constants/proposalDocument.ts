import type { PropertyType } from "@/types/property";
import type { ProposalDetailFields, ProposalOverviewFields } from "@/types/proposal";

export const WHO_ARE_WE_COPY =
  "CredXP is India's premium commercial real estate intelligence platform — delivering pre-leased investments, enterprise office leasing, and institutional-grade property discovery with transparent, investor-first advisory.";

export const TRUST_FOOTER_ITEMS = [
  { label: "Trusted by Investors", sublabel: "Institutional-grade deals" },
  { label: "Transparent Deals", sublabel: "Clear terms & pricing" },
  { label: "Your Growth", sublabel: "Long-term value creation" },
] as const;

export const OVERVIEW_FIELD_CONFIG: Array<{ key: keyof ProposalOverviewFields; label: string }> = [
  { key: "buildingName", label: "Name of Building" },
  { key: "totalArea", label: "Total Area" },
  { key: "numberOfLifts", label: "Number of Lifts" },
  { key: "numberOfFloors", label: "Number of Floors" },
  { key: "location", label: "Location" },
];

export const DETAIL_FIELD_CONFIG: Array<{ key: keyof ProposalDetailFields; label: string; multiline?: boolean }> = [
  { key: "tenant", label: "Tenant" },
  { key: "aboutTenant", label: "About Tenant (with website link)", multiline: true },
  { key: "totalAreaLeased", label: "Total Area Leased" },
  { key: "exactAreaOffered", label: "Exact Area Offered" },
  { key: "rentPerSqft", label: "Rent (per sq ft in bracket)" },
  { key: "lockIn", label: "Lock-in" },
  { key: "leaseTenure", label: "Lease Tenure" },
  { key: "escalation", label: "Escalation" },
  { key: "noticePeriod", label: "Notice Period" },
  { key: "rentCommencementDate", label: "Rent Commencement Date" },
  { key: "offeredRoi", label: "Offered ROI" },
  { key: "expectedClosures", label: "Expected Closures" },
];

export interface KeyFeature {
  title: string;
  subtitle: string;
}

const DEFAULT_KEY_FEATURES: KeyFeature[] = [
  { title: "Pre-Leased Asset", subtitle: "Stable tenancy" },
  { title: "Fresh Lease", subtitle: "Long lock-in" },
  { title: "High Returns", subtitle: "Strong ROI" },
];

export const KEY_FEATURES_BY_TYPE: Partial<Record<PropertyType, KeyFeature[]>> = {
  Shop: [
    { title: "Pre-Leased Asset", subtitle: "Tenanted retail unit" },
    { title: "Fresh Lease", subtitle: "Long lock-in period" },
    { title: "High Returns", subtitle: "Attractive rental yield" },
  ],
  "Pre-Leased Office": [
    { title: "Pre-Leased Asset", subtitle: "Grade-A tenancy" },
    { title: "Fresh Lease", subtitle: "Multi-year lock-in" },
    { title: "High Returns", subtitle: "Stable cash flow" },
  ],
  "Office Space": [
    { title: "Premium Office", subtitle: "Enterprise-ready space" },
    { title: "Flexible Terms", subtitle: "Lease options available" },
    { title: "Prime Location", subtitle: "Strong connectivity" },
  ],
  "Retail/SCO": [
    { title: "High Visibility", subtitle: "Road-facing retail" },
    { title: "Pre-Leased Option", subtitle: "Established tenancy" },
    { title: "Strong Footfall", subtitle: "Dense catchment" },
  ],
  Warehouse: [
    { title: "Logistics Ready", subtitle: "Industrial-grade asset" },
    { title: "Long Lease", subtitle: "Stable occupancy" },
    { title: "Yield Focused", subtitle: "Income-generating" },
  ],
};

export function getKeyFeatures(propertyType?: string): KeyFeature[] {
  if (!propertyType) return DEFAULT_KEY_FEATURES;
  return KEY_FEATURES_BY_TYPE[propertyType as PropertyType] || DEFAULT_KEY_FEATURES;
}

export function emptyOverviewFields(): ProposalOverviewFields {
  return {
    buildingName: "",
    totalArea: "",
    numberOfLifts: "",
    numberOfFloors: "",
    location: "",
  };
}

export function emptyDetailFields(): ProposalDetailFields {
  return {
    tenant: "",
    aboutTenant: "",
    totalAreaLeased: "",
    exactAreaOffered: "",
    rentPerSqft: "",
    lockIn: "",
    leaseTenure: "",
    escalation: "",
    noticePeriod: "",
    rentCommencementDate: "",
    offeredRoi: "",
    expectedClosures: "",
  };
}

export function emptyAgentResearch(): { pros: [string, string, string]; cons: [string, string, string] } {
  return { pros: ["", "", ""], cons: ["", "", ""] };
}
