/**
 * Maps June 2026 rent listings (by buildingName) to TempImages theme slugs.
 * Each property receives 3 images: hook + 2 gallery from the same triplet.
 */

const { imagesForTheme } = require("./tempImageCatalog");

/** buildingName → theme slug */
const BUILDING_NAME_TO_THEME = {
  // Shops (12)
  "DLF Super Mart-1 — B-246": "neighborhood-grocery-store",
  "Cross Point — 1,350 sq ft GF": "luxury-multibrand-retail-store",
  "MGF Megacity Mall — 25": "luxury-multibrand-retail-store",
  "Vyapaar Kendra — C-100": "bookstore",
  "Vyapar Kendra — P-100": "electronics-store",
  "Rodeo Drive — DG-57": "modern-fashion-boutique",
  "Apna Enclave — B-8": "pharmacy",
  "MGF Metropolis Mall — Shop 48": "luxury-multibrand-retail-store",
  "MGF Metropolitan Mall — FF-23": "modern-fashion-boutique",
  "MGF Metro Polish — 27": "furniture-showroom",
  "Signature Global The Millenia-3 — 24": "coffee-shop",
  "SCO-36, Sector 18": "home-decor-store",

  // Offices (12)
  "DLF Phase 1 — A-26/12C": "corporate-headquarters",
  "DLF Phase 1 — A-55/16": "enterprise-operations-center",
  "DLF Phase 1 — C-5/1": "corporate-headquarters",
  "DLF Phase 1 — E-5/16": "startup-office",
  "DLF Phase 1 — H-1/21": "coworking-space",
  "DLF Phase 2 — K-1/12": "executive-office-suite",
  "DLF Phase 2 — K-7/5": "executive-office-suite",
  "DLF Phase 4 — 3102": "boardroom-meeting-center",
  "DLF Phase 4 — 4101": "executive-office-suite",
  "Sushant Lok-1 — A-570": "real-estate-office",
  "Udyog Vihar Phase 1 — Plot 29": "tech-company-workspace",
  "Udyog Vihar Phase 1 — Plot 62": "design-studio",
};

function themeForBuildingName(buildingName) {
  const theme = BUILDING_NAME_TO_THEME[buildingName];
  if (!theme) {
    throw new Error(`No TempImages theme assigned for buildingName: ${buildingName}`);
  }
  return theme;
}

function imagesForBuildingName(buildingName) {
  return imagesForTheme(themeForBuildingName(buildingName));
}

function listingImages(listing) {
  const buildingName = listing.buildingName;
  if (!buildingName) {
    throw new Error(`Listing missing buildingName: ${listing.title || "(unknown)"}`);
  }
  const images = imagesForBuildingName(buildingName);
  return {
    images,
    coverImage: images[0],
    imagePublicIds: [],
    coverImagePublicId: "",
    theme: themeForBuildingName(buildingName),
  };
}

module.exports = {
  BUILDING_NAME_TO_THEME,
  themeForBuildingName,
  imagesForBuildingName,
  listingImages,
};
