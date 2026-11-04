import api from "@/lib/api";

export interface ContactMessagePayload {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  enquiryType: string;
  message: string;
  _hp?: string;
  _t?: number;
}

const contactService = {
  create: (data: ContactMessagePayload): Promise<{ data: ContactMessagePayload & { _id: string } }> =>
    api.post("/contact", data),
  subscribeNewsletter: (email: string, guard: { _hp?: string; _t?: number } = {}): Promise<{ success: boolean }> =>
    api.post("/contact/newsletter", { email, ...guard }),
};

export default contactService;
