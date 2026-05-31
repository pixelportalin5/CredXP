import type { Property } from "./property";
import type { User } from "./auth";

export interface Enquiry {
  _id: string;
  customerName: string;
  email: string;
  phone?: string;
  message?: string;
  propertyId: Pick<Property, "_id" | "title" | "type" | "location" | "price"> | string;
  sellerId?: Pick<User, "_id" | "name" | "email" | "phone" | "role"> | string;
  userId?: Pick<User, "_id" | "name" | "email" | "phone" | "role"> | string;
  status?: "open" | "closed";
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}
