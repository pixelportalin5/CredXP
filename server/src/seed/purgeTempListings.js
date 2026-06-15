#!/usr/bin/env node
/**
 * Remove temporary / seed listings before go-live.
 * Deletes: June 2026 PDF seed batch, legacy GGN-JUN26 tag, demo "Lease -" samples.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const prisma = require("../lib/prisma");
const { invalidatePrefix } = require("../utils/queryCache");
const { SEED_BUILDING_NAMES: OLD_JUNE_BUILDINGS, LEGACY_SEED_TAG } = require("./data/june2026PdfListings");
const { SEED_BATCH: RENT_SHOPS_BATCH } = require("./data/june2026RentShops");
const { SEED_BATCH: RENT_OFFICES_BATCH } = require("./data/june2026RentOffices");

async function purgeTempListings({ keepRentPdfSeeds = false } = {}) {
  const orClauses = [
    { buildingName: { in: OLD_JUNE_BUILDINGS } },
    { title: { startsWith: LEGACY_SEED_TAG } },
    { title: { startsWith: "GGN-JUN26" } },
    { highlights: { has: LEGACY_SEED_TAG } },
    { highlights: { has: "june2026-pdf-listings" } },
    { title: { startsWith: "Lease - " } },
  ];

  if (!keepRentPdfSeeds) {
    orClauses.push({ highlights: { has: RENT_SHOPS_BATCH } });
    orClauses.push({ highlights: { has: RENT_OFFICES_BATCH } });
  }

  const result = await prisma.property.deleteMany({
    where: { OR: orClauses },
  });

  invalidatePrefix("properties");
  return result.count;
}

async function main() {
  if (!process.env.DATABASE_URL?.startsWith("postgresql://")) {
    console.error("[purge-temp] DATABASE_URL must be postgresql://");
    process.exit(1);
  }

  const removed = await purgeTempListings();
  console.log(`[purge-temp] Removed ${removed} temporary listing(s)`);
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[purge-temp] Failed:", err.message);
    prisma.$disconnect().finally(() => process.exit(1));
  });
}

module.exports = { purgeTempListings };
