import api from "@/lib/api";
import type { Proposal } from "@/types/proposal";
import type { StaffPortal } from "@/utils/staffPortal";

export function getProposalService(portal: StaffPortal) {
  const base = `/${portal}/proposals`;

  return {
    create: (propertyId: string): Promise<{ data: Proposal }> =>
      api.post(base, { propertyId }),

    list: (): Promise<{ data: Proposal[] }> =>
      api.get(base),

    getById: (id: string): Promise<{ data: Proposal }> =>
      api.get(`${base}/${id}`),

    delete: (id: string): Promise<{ data: { id: string } }> =>
      api.delete(`${base}/${id}`),
  };
}

const proposalService = {
  getPublic: (id: string): Promise<{ data: Proposal }> =>
    api.get(`/proposals/${id}/public`),
};

export default proposalService;
