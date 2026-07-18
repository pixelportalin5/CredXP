export interface ProposalAgent {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface ProposalField {
  key: string;
  label: string;
  value: string;
}

export interface PreparedFor {
  name: string;
  email?: string;
  phone?: string;
}

export interface AgentResearch {
  pros: [string, string, string];
  cons: [string, string, string];
}

export interface ProposalOverviewFields {
  buildingName: string;
  totalArea: string;
  numberOfLifts: string;
  numberOfFloors: string;
  location: string;
}

export interface ProposalDetailFields {
  tenant: string;
  aboutTenant: string;
  totalAreaLeased: string;
  exactAreaOffered: string;
  rentPerSqft: string;
  lockIn: string;
  leaseTenure: string;
  escalation: string;
  noticePeriod: string;
  rentCommencementDate: string;
  offeredRoi: string;
  expectedClosures: string;
}

/** A single property's data as stored inside a saved proposal. */
export interface ProposalPropertyEntry {
  propertyId: string;
  propertyTitle: string;
  propertyType?: string;
  propertySnapshot: ProposalField[];
  coverImage?: string;
  overviewFields?: ProposalOverviewFields;
  detailFields?: ProposalDetailFields;
  agentResearch?: AgentResearch;
}

/** What the client sends for one property when creating/updating a proposal. */
export interface ProposalPropertyInput {
  propertyId: string;
  overviewFields: ProposalOverviewFields;
  detailFields: ProposalDetailFields;
  agentResearch?: AgentResearch;
}

export interface ProposalCreatePayload {
  preparedFor: PreparedFor;
  properties: ProposalPropertyInput[];
}

export type ProposalUpdatePayload = ProposalCreatePayload;

export interface Proposal {
  _id: string;
  agent: ProposalAgent;
  preparedFor?: PreparedFor;
  properties: ProposalPropertyEntry[];
  // Convenience mirrors of the primary (first) property, kept for any
  // legacy single-property UI that hasn't been updated to iterate `properties`.
  propertyId?: string;
  propertyTitle?: string;
  propertyType?: string;
  propertySnapshot?: ProposalField[];
  coverImage?: string;
  overviewFields?: ProposalOverviewFields;
  detailFields?: ProposalDetailFields;
  agentResearch?: AgentResearch;
  createdAt: string;
  draftUpdatedAt?: number;
}
