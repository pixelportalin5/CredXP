/* ============================================================
   Coworking Domain Types
   ============================================================ */

import type { User } from "./auth";

export interface CoworkingLocation {
  address: string;
  city: string;
  state: string;
  micromarket?: string;
  landmark?: string;
}

export interface CoworkingSpace {
  _id: string;
  title: string;
  name?: string;
  operator: string;
  operatorLogo?: string;
  website?: string;
  seller?: string | Pick<User, "_id" | "name" | "email" | "role">;
  location: CoworkingLocation;
  monthlySeatPrice: number;
  priceLabel: string;
  workspaceType: string;
  pricing?: {
    hotDesk?: number;
    dedicatedDesk?: number;
    privateCabin?: number;
    customSuite?: number;
    pricingUnit: "day" | "month" | "seat/month";
  };
  capacity?: {
    totalSeats?: number;
    availableSeats?: number;
    minSeats?: number;
    maxSeats?: number;
  };
  images: string[];
  imagePublicIds?: string[];
  coverImage?: string;
  coverImagePublicId?: string;
  amenities: string[];
  highlights?: string[];
  description: string;
  specs?: {
    seatsFrom?: number;
    privateCabins?: boolean;
    meetingRooms?: boolean;
    internet?: boolean;
    parking?: boolean;
  };
  isActive?: boolean;
  featured?: boolean;
  views?: number;
  enquiryCount?: number;
  listingStatus?: "draft" | "published" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface CoworkingFilters {
  page: number;
  limit: number;
  city?: string;
  operator?: string;
  minPrice?: string;
  maxPrice?: string;
  minSeats?: string;
  sort?: string;
  q?: string;
}
