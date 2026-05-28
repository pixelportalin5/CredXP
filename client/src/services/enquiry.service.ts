import api from "@/lib/api";
import type { Enquiry } from "@/types/enquiry";

const enquiryService = {
  create: (data: {
    customerName: string;
    email: string;
    phone?: string;
    message?: string;
    propertyId: string;
  }): Promise<{ data: Enquiry }> => api.post("/enquiries", data),

  getSellerEnquiries: (params: Record<string, unknown> = {}): Promise<{ data: Enquiry[] }> =>
    api.get("/enquiries/seller", { params }),
};

export default enquiryService;
