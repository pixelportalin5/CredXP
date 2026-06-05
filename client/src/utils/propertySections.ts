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

function isPreLeasedBuyType(type: Property["type"]) {
  return type === "Pre-Leased Office" || type === "Shop" || type === "Retail/SCO";
}

function isLeaseListing(property: Property) {
  const unit = property.financials?.priceUnit;
  return unit === "month" || unit === "year";
}

export function getPropertySection(property: Property): PropertySection {
  if (isLeaseListing(property)) {
    return isShopType(property.type) ? "shops-to-rent" : "offices-to-rent";
  }

  if (isPreLeasedBuyType(property.type)) {
    return isShopType(property.type) ? "shops-to-buy" : "offices-to-buy";
  }

  if (property.type === "Office Space") {
    return "offices-to-rent";
  }

  if (isShopType(property.type)) {
    return "shops-to-rent";
  }

  return "offices-to-buy";
}

export function getPropertySectionCoverImage(property: Property): string {
  if (property.coverImage) return property.coverImage;
  if (property.images?.[0]) return property.images[0];

  const section = getPropertySection(property);

  if (section === "offices-to-buy") return "/images/office1.png";
  if (section === "offices-to-rent") return "/images/office2.png";
  if (section === "shops-to-buy") return "/images/shop1.png";
  return "/images/shop2.png";
}
