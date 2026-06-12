#!/usr/bin/env node
/**
 * Seed 20 Gurugram commercial listings from June 2026 broker PDFs.
 * - 10 invest (/invest) — priceUnit: total, types: Pre-Leased Office | Shop
 * - 10 lease (/lease) — priceUnit: month, types: Office Space | Shop
 *
 * Usage: node src/seed/seedJune2026PdfListings.js
 *        node src/seed/seedJune2026PdfListings.js --force  (delete & re-insert tagged rows)
 *        node src/seed/seedJune2026PdfListings.js --sync-titles  (update titles in place, keeps images)
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const prisma = require("../lib/prisma");
const { propertyDataToPrisma } = require("../lib/prisma/mappers");
const { newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { buildPropertyWhere } = require("../lib/prisma/propertyQuery");
const {
  investListings,
  leaseListings,
  allSeedListings,
  SEED_BUILDING_NAMES,
  SEED_BATCH,
  LEGACY_SEED_TAG,
} = require("./data/june2026PdfListings");
const { invalidatePrefix } = require("../utils/queryCache");

const FORCE = process.argv.includes("--force");
const SYNC_TITLES = process.argv.includes("--sync-titles") || !FORCE;

function normalizeListing(raw) {
  const { brokerContact, featured, ...rest } = raw;
  const highlights = [...(rest.highlights || [])].filter(
    (item) => item !== LEGACY_SEED_TAG && item !== SEED_BATCH
  );
  if (brokerContact && !highlights.some((h) => h.startsWith("Broker:"))) {
    highlights.push(`Broker: ${brokerContact}`);
  }

  return {
    ...rest,
    highlights,
    images: rest.images ?? [],
    imagePublicIds: rest.imagePublicIds ?? [],
    coverImage: rest.coverImage ?? "",
    coverImagePublicId: rest.coverImagePublicId ?? "",
    status: "Recently Posted",
    grade: rest.grade || "A",
    isActive: true,
    listingStatus: "published",
    featured: Boolean(featured),
    description: rest.description,
  };
}

function seedBatchWhere() {
  return {
    OR: [
      { buildingName: { in: SEED_BUILDING_NAMES } },
      { title: { startsWith: `${LEGACY_SEED_TAG}` } },
      { highlights: { has: LEGACY_SEED_TAG } },
      { highlights: { has: SEED_BATCH } },
    ],
  };
}

async function deleteTagged() {
  const deleted = await prisma.property.deleteMany({
    where: seedBatchWhere(),
  });
  return deleted.count;
}

async function insertListing(listing) {
  const payload = normalizeListing(listing);
  const data = propertyDataToPrisma(payload);

  return prisma.property.create({
    data: {
      id: newUuid(),
      legacyMongoId: newLegacyMongoId(),
      ...data,
      status: "Recently_Posted",
    },
  });
}

async function syncTitlesInPlace() {
  let updated = 0;

  for (const listing of allSeedListings) {
    const payload = normalizeListing(listing);
    const data = propertyDataToPrisma(payload);

    const existing = await prisma.property.findFirst({
      where: { buildingName: listing.buildingName },
      select: { id: true, title: true, highlights: true },
    });

    if (!existing) continue;

    const nextHighlights = payload.highlights;
    const needsTitleUpdate = existing.title !== listing.title;
    const needsHighlightUpdate =
      JSON.stringify(existing.highlights || []) !== JSON.stringify(nextHighlights);

    if (!needsTitleUpdate && !needsHighlightUpdate) continue;

    await prisma.property.update({
      where: { id: existing.id },
      data: {
        title: listing.title,
        highlights: nextHighlights,
      },
    });
    updated += 1;
    console.log(`[seed-june2026] Renamed: ${existing.title} -> ${listing.title}`);
  }

  if (updated > 0) {
    invalidatePrefix("properties");
  }

  return updated;
}

async function countForCategory(category) {
  return prisma.property.count({
    where: buildPropertyWhere({ category, page: 1, limit: 1 }),
  });
}

async function countSeedBatch() {
  return prisma.property.count({
    where: { buildingName: { in: SEED_BUILDING_NAMES } },
  });
}

async function main() {
  if (!process.env.DATABASE_URL?.startsWith("postgresql://")) {
    console.error("[seed-june2026] DATABASE_URL must be a postgresql:// connection string");
    process.exit(1);
  }

  if (SYNC_TITLES) {
    const renamed = await syncTitlesInPlace();
    if (renamed > 0) {
      console.log(`[seed-june2026] Updated ${renamed} listing title(s) in place (images preserved)`);
    }
  }

  const existing = await countSeedBatch();

  if (existing >= 20 && !FORCE) {
    console.log(`[seed-june2026] Already seeded (${existing} listings). Use --force to replace.`);
    await printFilterReport();
    await prisma.$disconnect();
    process.exit(0);
  }

  if (FORCE && existing > 0) {
    const removed = await deleteTagged();
    console.log(`[seed-june2026] Removed ${removed} existing tagged listings`);
  }

  let investInserted = 0;
  let leaseInserted = 0;

  for (const listing of investListings) {
    await insertListing(listing);
    investInserted += 1;
  }

  for (const listing of leaseListings) {
    await insertListing(listing);
    leaseInserted += 1;
  }

  invalidatePrefix("properties");

  console.log(`[seed-june2026] Inserted ${investInserted} invest + ${leaseInserted} lease listings`);
  await printFilterReport();
  await prisma.$disconnect();
}

async function printFilterReport() {
  const seedWhere = { buildingName: { in: SEED_BUILDING_NAMES } };
  const [investTotal, leaseTotal, taggedInvest, taggedLease] = await Promise.all([
    countForCategory("investment"),
    countForCategory("lease"),
    prisma.property.count({
      where: {
        ...buildPropertyWhere({ category: "investment" }),
        ...seedWhere,
      },
    }),
    prisma.property.count({
      where: {
        ...buildPropertyWhere({ category: "lease" }),
        ...seedWhere,
      },
    }),
  ]);

  console.log("[seed-june2026] Filter verification:");
  console.log(`  /invest  (category=investment): ${investTotal} total, ${taggedInvest} from June 2026 PDFs`);
  console.log(`  /lease   (category=lease):       ${leaseTotal} total, ${taggedLease} from June 2026 PDFs`);

  if (taggedInvest < 10 || taggedLease < 10) {
    console.warn("[seed-june2026] WARN: Expected 10 listings in each category from this seed");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[seed-june2026] Failed:", error.message);
  prisma.$disconnect().finally(() => process.exit(1));
});
