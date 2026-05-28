import type { Property } from "./property";

export interface Enquiry {
  _id: string;
  customerName: string;
  email: string;
  phone?: string;
  message?: string;
  propertyId: Pick<Property, "_id" | "title" | "type" | "location" | "price"> | string;
  sellerId?: string;
  createdAt: string;
  updatedAt: string;
}
