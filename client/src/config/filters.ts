/* ============================================================
   Filter Configuration
   Centralized filter options for properties and coworking
   ============================================================ */

import type { SelectOption } from "@/types/common";

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
  { label: "Office Space", value: "Office Space" },
  { label: "Retail / SCO", value: "Retail/SCO" },
  { label: "Shop", value: "Shop" },
  { label: "Warehouse", value: "Warehouse" },
  { label: "Commercial Land", value: "Commercial Land" },
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
  { label: "Under ₹25,000", min: "", max: "25000" },
  { label: "₹25K – ₹50K", min: "25000", max: "50000" },
  { label: "₹50K – ₹1 Lakh", min: "50000", max: "100000" },
  { label: "₹1L – ₹3 Lakh", min: "100000", max: "300000" },
  { label: "₹3L – ₹5 Lakh", min: "300000", max: "500000" },
  { label: "Above ₹5 Lakh", min: "500000", max: "" },
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
