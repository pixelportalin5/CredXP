import api from "@/lib/api";

export interface ContactMessagePayload {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  enquiryType: string;
  message: string;
}

const contactService = {
  create: (data: ContactMessagePayload): Promise<{ data: ContactMessagePayload & { _id: string } }> =>
    api.post("/contact", data),
};

export default contactService;
