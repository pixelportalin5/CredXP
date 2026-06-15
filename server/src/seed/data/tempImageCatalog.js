/**
 * TempImages catalog — 15 shop + 15 office triplets from client/public/images/TempImages.
 * Each theme has a curated hook (best list-card hero) plus 2 gallery images from the same set.
 */

const fs = require("fs");
const path = require("path");

const TEMP_IMAGES_DIR = path.resolve(
  __dirname,
  "../../../../client/public/images/TempImages"
);
const PUBLIC_BASE = "/images/TempImages";

/** Curated hook suffix (918xx) per theme — chosen for strong card/detail hero shots. */
const HOOK_SUFFIX_BY_SLUG = {
  // Shops
  "automobile-accessories-shop": "91858",
  bakery: "91840",
  bookstore: "91830",
  "coffee-shop": "91843",
  "electronics-store": "91822",
  "furniture-showroom": "91836",
  "home-decor-store": "91855",
  "luxury-jewelry-store": "91828",
  "luxury-multibrand-retail-store": "91860",
  "mobile-phone-store": "91849",
  "modern-fashion-boutique": "91819",
  "neighborhood-grocery-store": "91824",
  "pet-store": "91852",
  pharmacy: "91834",
  "sports-store": "91846",
  // Offices
  "boardroom-meeting-center": "91900",
  "call-center": "91894",
  "corporate-headquarters": "91867",
  "coworking-space": "91873",
  "creative-agency-office": "91879",
  "design-studio": "91888",
  "enterprise-operations-center": "91903",
  "executive-office-suite": "91875",
  "financial-services-office": "91882",
  "innovation-lab": "91897",
  "law-firm-office": "91885",
  "luxury-penthouse-office": "91906",
  "real-estate-office": "91891",
  "startup-office": "91864",
  "tech-company-workspace": "91870",
};

const SHOP_SLUGS = [
  "automobile-accessories-shop",
  "bakery",
  "bookstore",
  "coffee-shop",
  "electronics-store",
  "furniture-showroom",
  "home-decor-store",
  "luxury-jewelry-store",
  "luxury-multibrand-retail-store",
  "mobile-phone-store",
  "modern-fashion-boutique",
  "neighborhood-grocery-store",
  "pet-store",
  "pharmacy",
  "sports-store",
];

const OFFICE_SLUGS = [
  "boardroom-meeting-center",
  "call-center",
  "corporate-headquarters",
  "coworking-space",
  "creative-agency-office",
  "design-studio",
  "enterprise-operations-center",
  "executive-office-suite",
  "financial-services-office",
  "innovation-lab",
  "law-firm-office",
  "luxury-penthouse-office",
  "real-estate-office",
  "startup-office",
  "tech-company-workspace",
];

function parseFilename(filename) {
  const match = /^magnific__(.+?)__(\d+)\.jpg$/i.exec(filename);
  if (!match) return null;

  const rawSlug = match[1]
    .replace(/-professional-commercial.*$/i, "")
    .replace(/-professional-commer.*$/i, "")
    .replace(/-professional-real-estate.*$/i, "")
    .replace(/-photogr.*$/i, "")
    .replace(/-phot.*$/i, "")
    .replace(/-real-est.*$/i, "")
    .replace(/-real-es.*$/i, "")
    .replace(/-commerci.*$/i, "")
    .replace(/-commercial.*$/i, "")
    .replace(/-rea__.*$/i, "")
    .replace(/-re__.*$/i, "")
    .replace(/-ph__.*$/i, "")
    .replace(/-p__.*$/i, "")
    .replace(/-phot__.*$/i, "")
    .replace(/-__.*$/i, "")
    .replace(/-$/, "");

  // Normalize truncated slug segments back to canonical slugs.
  const slugAliases = {
    "automobile-accessories-shop": "automobile-accessories-shop",
    "automobile-accessories-shop-professional-commercia": "automobile-accessories-shop",
    "bakery-professional-commercial-real-estate-photogr": "bakery",
    "boardroom-meeting-center-professional-commercial-r": "boardroom-meeting-center",
    "bookstore-professional-commercial-real-estate-phot": "bookstore",
    "call-center-professional-commercial-real-estate-ph": "call-center",
    "coffee-shop-professional-commercial-real-estate-ph": "coffee-shop",
    "corporate-headquarters-professional-commercial-rea": "corporate-headquarters",
    "coworking-space-professional-commercial-real-estat": "coworking-space",
    "creative-agency-office-professional-commercial-rea": "creative-agency-office",
    "design-studio-professional-commercial-real-estate-": "design-studio",
    "electronics-store-professional-commercial-real-est": "electronics-store",
    "enterprise-operations-center-professional-commerci": "enterprise-operations-center",
    "executive-office-suite-professional-commercial-rea": "executive-office-suite",
    "financial-services-office-professional-commercial-": "financial-services-office",
    "furniture-showroom-professional-commercial-real-es": "furniture-showroom",
    "home-decor-store-professional-commercial-real-esta": "home-decor-store",
    "innovation-lab-professional-commercial-real-estate": "innovation-lab",
    "law-firm-office-professional-commercial-real-estat": "law-firm-office",
    "luxury-jewelry-store-professional-commercial-real-": "luxury-jewelry-store",
    "luxury-multibrand-retail-store-professional-commer": "luxury-multibrand-retail-store",
    "luxury-penthouse-office-professional-commercial-re": "luxury-penthouse-office",
    "mobile-phone-store-professional-commercial-real-es": "mobile-phone-store",
    "modern-fashion-boutique-professional-commercial-re": "modern-fashion-boutique",
    "neighborhood-grocery-store-professional-commercial": "neighborhood-grocery-store",
    "pet-store-professional-commercial-real-estate-phot": "pet-store",
    "pharmacy-professional-commercial-real-estate-photo": "pharmacy",
    "real-estate-office-professional-commercial-real-es": "real-estate-office",
    "sports-store-professional-commercial-real-estate-p": "sports-store",
    "startup-office-professional-commercial-real-estate": "startup-office",
    "tech-company-workspace-professional-commercial-rea": "tech-company-workspace",
  };

  const slug = slugAliases[match[1]] || slugAliases[rawSlug] || rawSlug;
  return { slug, suffix: match[2], filename };
}

function loadCatalogFromDisk() {
  const files = fs.readdirSync(TEMP_IMAGES_DIR).filter((f) => f.endsWith(".jpg"));
  const groups = new Map();

  for (const filename of files) {
    const parsed = parseFilename(filename);
    if (!parsed) continue;

    if (!groups.has(parsed.slug)) {
      groups.set(parsed.slug, []);
    }
    groups.get(parsed.slug).push({ suffix: parsed.suffix, filename });
  }

  const catalog = { shop: {}, office: {} };

  function buildTheme(slug, kind) {
    const entries = (groups.get(slug) || []).sort((a, b) =>
      Number(a.suffix) - Number(b.suffix)
    );
    if (entries.length !== 3) {
      throw new Error(
        `Expected 3 images for theme "${slug}", found ${entries.length}. Check TempImages folder.`
      );
    }

    const hookSuffix = HOOK_SUFFIX_BY_SLUG[slug];
    const hookEntry = entries.find((e) => e.suffix === hookSuffix) || entries[1];
    const galleryEntries = entries.filter((e) => e.filename !== hookEntry.filename);

    const toPath = (fname) => `${PUBLIC_BASE}/${fname}`;

    catalog[kind][slug] = {
      slug,
      kind,
      files: entries.map((e) => e.filename),
      hookFile: hookEntry.filename,
      galleryFiles: galleryEntries.map((e) => e.filename),
      images: [toPath(hookEntry.filename), ...galleryEntries.map((e) => toPath(e.filename))],
    };
  }

  for (const slug of SHOP_SLUGS) buildTheme(slug, "shop");
  for (const slug of OFFICE_SLUGS) buildTheme(slug, "office");

  return catalog;
}

let cachedCatalog = null;

function getCatalog() {
  if (!cachedCatalog) {
    cachedCatalog = loadCatalogFromDisk();
  }
  return cachedCatalog;
}

function imagesForTheme(slug) {
  const catalog = getCatalog();
  const theme = catalog.shop[slug] || catalog.office[slug];
  if (!theme) {
    throw new Error(`Unknown TempImages theme slug: ${slug}`);
  }
  return [...theme.images];
}

function coverImageForTheme(slug) {
  return imagesForTheme(slug)[0];
}

module.exports = {
  PUBLIC_BASE,
  TEMP_IMAGES_DIR,
  SHOP_SLUGS,
  OFFICE_SLUGS,
  HOOK_SUFFIX_BY_SLUG,
  getCatalog,
  imagesForTheme,
  coverImageForTheme,
};
