import api from "@/lib/api";
import type { Enquiry } from "@/types/enquiry";

const enquiryService = {
  create: (data: {
    customerName: string;
    email: string;
    phone?: string;
    message?: string;
    propertyId?: string;
    coworkingSpaceId?: string;
  }): Promise<{ data: Enquiry }> => api.post("/enquiries", data),

  getSellerEnquiries: (params: Record<string, unknown> = {}): Promise<{ data: Enquiry[] }> =>
    api.get("/enquiries/seller", { params }),

  getMyEnquiries: (params: Record<string, unknown> = {}): Promise<{ data: Enquiry[] }> =>
    api.get("/enquiries/me", { params }),

  removeMyEnquiry: (enquiryId: string): Promise<{ data: { id: string } }> =>
    api.delete(`/enquiries/me/${enquiryId}`),

  clearMyEnquiries: (): Promise<{ data: { count: number } }> =>
    api.delete("/enquiries/me"),

  closeSellerEnquiry: (enquiryId: string): Promise<{ data: Enquiry }> =>
    api.patch(`/enquiries/seller/${enquiryId}/close`),
};

export default enquiryService;
