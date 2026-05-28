import type { Property } from "@/types/property";

export type PropertySection =
  | "offices-to-buy"
  | "offices-to-rent"
  | "shops-to-buy"
  | "shops-to-rent";

function isOfficeType(type: Property["type"]) {
  return type === "Office Space" || type === "Pre-Leased Office";
}

function isShopType(type: Property["type"]) {
  return type === "Shop" || type === "Retail/SCO";
}

function isRentStatus(status: Property["status"]) {
  return status === "Recently Posted" || status === "Available";
}

export function getPropertySection(property: Property): PropertySection {
  const rent = isRentStatus(property.status);

  if (isOfficeType(property.type)) {
    return rent ? "offices-to-rent" : "offices-to-buy";
  }

  if (isShopType(property.type)) {
    return rent ? "shops-to-rent" : "shops-to-buy";
  }

  // Fallback for other commercial types to keep cards deterministic.
  return rent ? "offices-to-rent" : "offices-to-buy";
}

export function getPropertySectionCoverImage(property: Property): string {
  if (property.images?.[0]) return property.images[0];

  const section = getPropertySection(property);

  if (section === "offices-to-buy") return "/images/office1.png";
  if (section === "offices-to-rent") return "/images/office2.png";
  if (section === "shops-to-buy") return "/images/shop1.png";
  return "/images/shop2.png";
}
