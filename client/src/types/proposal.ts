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

export interface ProposalCreatePayload {
  propertyId: string;
  preparedFor: PreparedFor;
  agentResearch: AgentResearch;
  overviewFields: ProposalOverviewFields;
  detailFields: ProposalDetailFields;
}

export interface Proposal {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  propertyType?: string;
  agent: ProposalAgent;
  propertySnapshot: ProposalField[];
  preparedFor?: PreparedFor;
  agentResearch?: AgentResearch;
  overviewFields?: ProposalOverviewFields;
  detailFields?: ProposalDetailFields;
  coverImage?: string;
  createdAt: string;
  draftUpdatedAt?: number;
}
