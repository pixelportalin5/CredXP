/* ============================================================
   Property Domain Types
   ============================================================ */

import type { Pagination } from "./common";

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  pincode?: string;
  micromarket?: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type PropertyType =
  | "Pre-Leased Office"
  | "Office Space"
  | "Retail/SCO"
  | "Coworking"
  | "Shop"
  | "Warehouse"
  | "Commercial Land";

export type PropertyStatus =
  | "Pre-Leased"
  | "Available"
  | "Trending"
  | "Recently Posted"
  | "Under Negotiation"
  | "Sold";

export type PropertyCategory =
  | "pre-leased"
  | "lease"
  | "coworking"
  | "investment";

export interface PropertyFinancials {
  price: number;
  priceUnit?: "month" | "year" | "sqft" | "total";
  securityDeposit?: number;
  maintenanceCharges?: number;
  rentalYield?: number;
  capRate?: number;
  escalation?: string;
}

export interface PropertySpecs {
  size: number;
  sizeUnit?: "sqft" | "sqm";
  floors?: number;
  totalFloors?: number;
  furnishing?: "Fully Furnished" | "Semi Furnished" | "Bare Shell" | "Warm Shell";
  parking?: number;
  cabins?: number;
  workstations?: number;
  meetingRooms?: number;
  pantry?: boolean;
  washrooms?: number;
}

export interface PropertyTenant {
  name?: string;
  industry?: string;
  leaseExpiry?: string;
  lockInPeriod?: string;
}

export interface Property {
  _id: string;
  title: string;
  slug?: string;
  type: PropertyType;
  category?: PropertyCategory;
  location: PropertyLocation;
  price: number;
  size: number;
  financials?: PropertyFinancials;
  specs?: PropertySpecs;
  tenant?: PropertyTenant;
  amenities: string[];
  images: string[];
  status: PropertyStatus;
  description: string;
  highlights?: string[];
  reraId?: string;
  buildingName?: string;
  grade?: "A" | "A+" | "B" | "B+";
  occupancy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  page: number;
  limit: number;
  type?: string;
  status?: string;
  city?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  minSize?: string;
  maxSize?: string;
  furnishing?: string;
  sort?: string;
  q?: string;
}

export interface PropertyListResponse {
  properties: Property[];
  pagination: Pagination;
}
