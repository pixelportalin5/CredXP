#!/usr/bin/env node
/**
 * Purge temp listings and seed 12 shops for rent from June 2026 rent PDF.
 *
 * Usage: node src/seed/seedJune2026RentShops.js
 *        node src/seed/seedJune2026RentShops.js --force  (re-insert shop batch)
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const prisma = require("../lib/prisma");
const { propertyDataToPrisma } = require("../lib/prisma/mappers");
const { newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { buildPropertyWhere } = require("../lib/prisma/propertyQuery");
const { rentShopListings, SEED_BATCH, SEED_BUILDING_NAMES } = require("./data/june2026RentShops");
const { purgeTempListings } = require("./purgeTempListings");
const { invalidatePrefix } = require("../utils/queryCache");

const FORCE = process.argv.includes("--force");

function normalizeListing(raw) {
  const { brokerContact, featured, ...rest } = raw;
  const highlights = [...(rest.highlights || []), SEED_BATCH];
  if (brokerContact && !highlights.some((h) => h.startsWith("Broker:"))) {
    highlights.push(`Broker: ${brokerContact}`);
  }

  return {
    ...rest,
    highlights,
    images: [],
    imagePublicIds: [],
    coverImage: "",
    coverImagePublicId: "",
    status: "Recently Posted",
    grade: rest.grade || "A",
    isActive: true,
    listingStatus: "published",
    featured: Boolean(featured),
    description: rest.description,
  };
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

async function main() {
  if (!process.env.DATABASE_URL?.startsWith("postgresql://")) {
    console.error("[seed-rent-shops] DATABASE_URL must be postgresql://");
    process.exit(1);
  }

  const purged = await purgeTempListings({ keepRentShops: !FORCE });
  console.log(`[seed-rent-shops] Purged ${purged} temporary listing(s)`);

  const existing = await prisma.property.count({
    where: { highlights: { has: SEED_BATCH } },
  });

  if (existing >= rentShopListings.length && !FORCE) {
    console.log(`[seed-rent-shops] Already seeded (${existing} shops). Use --force to replace.`);
    await printReport();
    await prisma.$disconnect();
    return;
  }

  if (FORCE && existing > 0) {
    const removed = await prisma.property.deleteMany({
      where: { highlights: { has: SEED_BATCH } },
    });
    console.log(`[seed-rent-shops] Removed ${removed.count} existing shop batch row(s)`);
  }

  let inserted = 0;
  for (const listing of rentShopListings) {
    await insertListing(listing);
    inserted += 1;
  }

  invalidatePrefix("properties");
  console.log(`[seed-rent-shops] Inserted ${inserted} shop(s) for rent`);
  await printReport();
  await prisma.$disconnect();
}

async function printReport() {
  const shopLeaseWhere = {
    ...buildPropertyWhere({ category: "lease", type: "Shop" }),
    highlights: { has: SEED_BATCH },
  };
  const allLeaseShops = buildPropertyWhere({ category: "lease", type: "Shop" });

  const [seededShops, totalLeaseShops, rows] = await Promise.all([
    prisma.property.count({ where: shopLeaseWhere }),
    prisma.property.count({ where: allLeaseShops }),
    prisma.property.findMany({
      where: shopLeaseWhere,
      select: { title: true, type: true, financialPriceUnit: true, price: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  console.log("[seed-rent-shops] Filter verification:");
  console.log(`  /lease?type=Shop: ${totalLeaseShops} total, ${seededShops} from June 2026 rent PDF`);

  for (const row of rows) {
    const ok = row.type === "Shop" && row.financialPriceUnit === "month";
    console.log(`  ${ok ? "PASS" : "FAIL"} | ${row.title} | ₹${row.price}/mo`);
  }

  if (seededShops < rentShopListings.length) {
    console.warn(`[seed-rent-shops] WARN: expected ${rentShopListings.length} shops`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[seed-rent-shops] Failed:", err.message);
  prisma.$disconnect().finally(() => process.exit(1));
});
