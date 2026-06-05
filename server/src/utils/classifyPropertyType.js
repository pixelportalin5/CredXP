const SHOP_SIGNALS = [
  "shop",
  "retail",
  "sco",
  "showroom",
  "store",
  "cafe",
  "restaurant",
  "bank branch",
  "domino",
  "lenskart",
  "liberty",
  "food",
  "f&b",
  "f & b",
  "ground floor retail",
];

const OFFICE_SIGNALS = [
  "office",
  "corporate",
  "it park",
  "tech park",
  "business park",
  "tower",
  "floor",
  "pre-leased office",
  "pre leased office",
  "workspace",
  "commercial space",
];

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function matchesAny(text, signals) {
  return signals.some((signal) => text.includes(signal));
}

function mapExcelType(value) {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  if (normalized.includes("shop") || normalized.includes("retail") || normalized.includes("sco")) {
    return "Shop";
  }
  if (normalized.includes("office") || normalized.includes("pre-leased") || normalized.includes("pre leased")) {
    return "Pre-Leased Office";
  }
  return null;
}

/**
 * Classify pre-leased inventory into office vs shop for buy listings.
 */
function classifyPropertyType(title, description, excelType) {
  const fromExcel = mapExcelType(excelType);
  const titleText = normalizeText(title);
  const descriptionText = normalizeText(description);
  const combined = `${titleText} ${descriptionText}`;

  const titleIsShop = matchesAny(titleText, SHOP_SIGNALS);
  const titleIsOffice = matchesAny(titleText, OFFICE_SIGNALS);
  const descriptionIsShop = matchesAny(descriptionText, SHOP_SIGNALS);
  const descriptionIsOffice = matchesAny(descriptionText, OFFICE_SIGNALS);

  if (titleIsShop && !titleIsOffice) return "Shop";
  if (titleIsOffice && !titleIsShop) return "Pre-Leased Office";

  if (descriptionIsShop && !descriptionIsOffice) return "Shop";
  if (descriptionIsOffice && !descriptionIsShop) return "Pre-Leased Office";

  if (fromExcel) return fromExcel;

  if (matchesAny(combined, SHOP_SIGNALS) && !matchesAny(combined, OFFICE_SIGNALS)) {
    return "Shop";
  }

  return "Pre-Leased Office";
}

module.exports = { classifyPropertyType };
