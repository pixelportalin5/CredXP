/* ============================================================
   Coworking Domain Types
   ============================================================ */

export interface CoworkingSpace {
  _id: string;
  name: string;
  operator: string;
  operatorLogo?: string;
  location: {
    address: string;
    city: string;
    state: string;
    micromarket?: string;
  };
  pricing: {
    hotDesk?: number;
    dedicatedDesk?: number;
    privateCabin?: number;
    customSuite?: number;
    pricingUnit: "day" | "month" | "seat/month";
  };
  capacity: {
    totalSeats: number;
    availableSeats?: number;
    minSeats?: number;
    maxSeats?: number;
  };
  amenities: string[];
  highlights: string[];
  images: string[];
  rating?: number;
  reviewCount?: number;
  operatingHours?: string;
  contractTerms?: string;
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
