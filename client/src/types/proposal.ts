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

export interface Proposal {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  agent: ProposalAgent;
  propertySnapshot: ProposalField[];
  createdAt: string;
}
