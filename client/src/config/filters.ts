/* ============================================================
   Filter Configuration
   Centralized filter options for properties and coworking
   ============================================================ */

import type { SelectOption } from "@/types/common";

/** Fallback only. Pages pass cities that actually have listings (see optionsFromListings). */
export const CITIES: SelectOption[] = [
  { label: "Gurugram", value: "Gurugram" },
  { label: "Delhi", value: "Delhi" },
  { label: "Noida", value: "Noida" },
  { label: "Bangalore", value: "Bangalore" },
  { label: "Mumbai", value: "Mumbai" },
  { label: "Pune", value: "Pune" },
  { label: "Hyderabad", value: "Hyderabad" },
  { label: "Chennai", value: "Chennai" },
  { label: "Ahmedabad", value: "Ahmedabad" },
  { label: "Kolkata", value: "Kolkata" },
];

export const PROPERTY_TYPES: SelectOption[] = [
  { label: "All Types", value: "" },
  { label: "Pre-Leased Office", value: "Pre-Leased Office" },
  { label: "Pre-Leased Bank", value: "Bank Rented" },
  { label: "Office Space", value: "Office Space" },
  { label: "Retail / SCO", value: "Retail/SCO" },
  { label: "Warehouse", value: "Warehouse" },
  { label: "Industrial & Land", value: "Commercial Land" },
];

export const INVEST_ASSET_TYPES: SelectOption[] = [
  { label: "Pre-Leased Office", value: "Pre-Leased Office" },
  { label: "Pre-Leased Bank", value: "Bank Rented" },
  { label: "Pre-Leased Retail / SCO", value: "Retail/SCO" },
  { label: "Industrial & Land", value: "Commercial Land" },
];

export const LEASE_SPACE_TYPES: SelectOption[] = [
  { label: "Office Space", value: "Office Space" },
  { label: "Retail / SCO", value: "Retail/SCO" },
];

export const PROPERTY_CATEGORIES: SelectOption[] = [
  { label: "All Categories", value: "" },
  { label: "Pre-Leased", value: "pre-leased" },
  { label: "Lease", value: "lease" },
  { label: "Coworking", value: "coworking" },
  { label: "Investment", value: "investment" },
];

export const PRICE_RANGES: { label: string; min: string; max: string }[] = [
  { label: "Any Budget", min: "", max: "" },
  { label: "Under ₹50 Lakh", min: "", max: "5000000" },
  { label: "₹50L – ₹1 Cr", min: "5000000", max: "10000000" },
  { label: "₹1 Cr – ₹3 Cr", min: "10000000", max: "30000000" },
  { label: "₹3 Cr – ₹5 Cr", min: "30000000", max: "50000000" },
  { label: "₹5 Cr – ₹10 Cr", min: "50000000", max: "100000000" },
  { label: "Above ₹10 Cr", min: "100000000", max: "" },
];

export const LEASE_PRICE_RANGES: { label: string; min: string; max: string }[] = [
  { label: "Any Rent", min: "", max: "" },
  { label: "Under ₹50K / month", min: "", max: "50000" },
  { label: "₹50K – ₹1L / month", min: "50000", max: "100000" },
  { label: "₹1L – ₹2L / month", min: "100000", max: "200000" },
  { label: "₹2L – ₹5L / month", min: "200000", max: "500000" },
  { label: "Above ₹5L / month", min: "500000", max: "" },
];

export const SIZE_RANGES: { label: string; min: string; max: string }[] = [
  { label: "Any Size", min: "", max: "" },
  { label: "Under 500 sqft", min: "", max: "500" },
  { label: "500 – 1,000 sqft", min: "500", max: "1000" },
  { label: "1,000 – 3,000 sqft", min: "1000", max: "3000" },
  { label: "3,000 – 5,000 sqft", min: "3000", max: "5000" },
  { label: "5,000 – 10,000 sqft", min: "5000", max: "10000" },
  { label: "Above 10,000 sqft", min: "10000", max: "" },
];

export const YIELD_RANGES: { label: string; min: string; max: string }[] = [
  { label: "Any Yield", min: "", max: "" },
  { label: "5%+", min: "5", max: "" },
  { label: "6%+", min: "6", max: "" },
  { label: "7%+", min: "7", max: "" },
  { label: "8%+", min: "8", max: "" },
];

export const SORT_OPTIONS: SelectOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Size: Largest First", value: "size_desc" },
  { label: "Size: Smallest First", value: "size_asc" },
  { label: "Yield: High to Low", value: "yield_desc" },
];

export const FURNISHING_OPTIONS: SelectOption[] = [
  { label: "Any Furnishing", value: "" },
  { label: "Fully Furnished", value: "Fully Furnished" },
  { label: "Semi Furnished", value: "Semi Furnished" },
  { label: "Bare Shell", value: "Bare Shell" },
  { label: "Warm Shell", value: "Warm Shell" },
];

/**
 * Builds city and type options from live listings so filters never offer
 * choices with no results. Falls back to Gurugram when the API is unavailable.
 */
export function optionsFromListings(listings: { type?: string; location?: { city?: string } }[]): {
  cities: SelectOption[];
  types: SelectOption[];
} {
  const normalizeCity = (city: string) => (/^gurgaon$/i.test(city) ? "Gurugram" : city);
  const cities = [...new Set(listings.map((item) => normalizeCity((item.location?.city || "").trim())).filter(Boolean))].sort(
    (a, b) => (a === "Gurugram" ? -1 : b === "Gurugram" ? 1 : a.localeCompare(b))
  );
  const types = [...new Set(listings.map((item) => (item.type || "").trim()).filter(Boolean))];
  return {
    cities: (cities.length ? cities : ["Gurugram"]).map((city) => ({ label: city, value: city })),
    types: [
      { label: "All Types", value: "" },
      ...(types.length
        ? PROPERTY_TYPES.filter((option) => option.value && types.includes(option.value))
        : PROPERTY_TYPES.filter((option) => option.value)),
    ],
  };
}

/** Display name for a listing type (badges, labels). */
const TYPE_LABELS: Record<string, string> = {
  "Bank Rented": "Pre-Leased Bank",
  Shop: "Retail / SCO",
  "Retail/SCO": "Retail / SCO",
  "Commercial Land": "Industrial & Land",
  Warehouse: "Industrial & Land",
};

/** Land and industrial assets: shown by price and area, not rent / ROI. */
export function isLandOrIndustrial(type: string): boolean {
  return type === "Commercial Land" || type === "Warehouse";
}

export function propertyTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type;
}
