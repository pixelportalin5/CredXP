import type { SelectOption } from "@/types/common";

export const COWORKING_CITIES: SelectOption[] = [
  { label: "All Locations", value: "" },
  { label: "Gurugram", value: "Gurugram" },
  { label: "Delhi", value: "Delhi" },
  { label: "Noida", value: "Noida" },
  { label: "Bangalore", value: "Bangalore" },
  { label: "Mumbai", value: "Mumbai" },
];

export const COWORKING_OPERATORS: SelectOption[] = [
  { label: "All Operators", value: "" },
  { label: "Regus", value: "Regus" },
  { label: "Desq Worx", value: "Desq Worx" },
  { label: "WeWork", value: "WeWork" },
  { label: "AWFIS", value: "AWFIS" },
  { label: "Smartworks", value: "Smartworks" },
];

export const COWORKING_PRICE_RANGES: { label: string; min: string; max: string }[] = [
  { label: "Any Budget", min: "", max: "" },
  { label: "Under ₹8,000", min: "", max: "8000" },
  { label: "₹8K – ₹12K", min: "8000", max: "12000" },
  { label: "₹12K – ₹20K", min: "12000", max: "20000" },
  { label: "Above ₹20K", min: "20000", max: "" },
];

export const COWORKING_SORT_OPTIONS: SelectOption[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];
