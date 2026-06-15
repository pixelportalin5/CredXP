#!/usr/bin/env node
/**
 * Purge temp listings and seed shops + offices for rent from June 2026 rent PDF.
 *
 * Usage: node src/seed/seedJune2026RentShops.js
 *        node src/seed/seedJune2026RentShops.js --force       (replace all PDF rent batches)
 *        node src/seed/seedJune2026RentShops.js --force-shops  (replace shops only)
 *        node src/seed/seedJune2026RentShops.js --force-offices (replace offices only)
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const prisma = require("../lib/prisma");
const { propertyDataToPrisma } = require("../lib/prisma/mappers");
const { newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { buildPropertyWhere } = require("../lib/prisma/propertyQuery");
const {
  rentShopListings,
  SEED_BATCH: SHOP_BATCH,
} = require("./data/june2026RentShops");
const {
  rentOfficeListings,
  SEED_BATCH: OFFICE_BATCH,
} = require("./data/june2026RentOffices");
const { purgeTempListings } = require("./purgeTempListings");
const { invalidatePrefix } = require("../utils/queryCache");

const ADMIN_EMAIL = "admin@gmail.com";

const FORCE_ALL = process.argv.includes("--force");
const FORCE_SHOPS = FORCE_ALL || process.argv.includes("--force-shops");
const FORCE_OFFICES = FORCE_ALL || process.argv.includes("--force-offices");

function normalizeListing(raw, batchTag) {
  const { brokerContact, featured, ...rest } = raw;
  const highlights = [...(rest.highlights || []), batchTag];
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

async function insertListing(listing, batchTag, sellerUuid) {
  const payload = normalizeListing(listing, batchTag);
  const data = propertyDataToPrisma(payload, { sellerUuid });

  return prisma.property.create({
    data: {
      id: newUuid(),
      legacyMongoId: newLegacyMongoId(),
      ...data,
      status: "Recently_Posted",
    },
  });
}

async function seedBatch({ batchTag, listings, force, label, sellerUuid }) {
  const existing = await prisma.property.count({
    where: { highlights: { has: batchTag } },
  });

  if (existing >= listings.length && !force) {
    console.log(`[seed-rent-pdf] ${label}: already seeded (${existing}). Skipping.`);
    return 0;
  }

  if (force && existing > 0) {
    const removed = await prisma.property.deleteMany({
      where: { highlights: { has: batchTag } },
    });
    console.log(`[seed-rent-pdf] ${label}: removed ${removed.count} existing row(s)`);
  } else if (existing > 0 && existing < listings.length) {
    const present = await prisma.property.findMany({
      where: { buildingName: { in: listings.map((l) => l.buildingName) } },
      select: { buildingName: true },
    });
    const presentSet = new Set(present.map((r) => r.buildingName));
    const toInsert = listings.filter((l) => !presentSet.has(l.buildingName));
    if (toInsert.length === 0) {
      console.log(`[seed-rent-pdf] ${label}: all buildings present (${existing} rows). Skipping.`);
      return 0;
    }
    let inserted = 0;
    for (const listing of toInsert) {
      await insertListing(listing, batchTag, sellerUuid);
      inserted += 1;
    }
    console.log(`[seed-rent-pdf] ${label}: inserted ${inserted} missing row(s)`);
    return inserted;
  }

  let inserted = 0;
  for (const listing of listings) {
    await insertListing(listing, batchTag, sellerUuid);
    inserted += 1;
  }

  console.log(`[seed-rent-pdf] ${label}: inserted ${inserted}`);
  return inserted;
}

async function printReport() {
  const shopWhere = {
    ...buildPropertyWhere({ category: "lease", type: "Shop" }),
    highlights: { has: SHOP_BATCH },
  };
  const officeWhere = {
    ...buildPropertyWhere({ category: "lease", type: "Office Space" }),
    highlights: { has: OFFICE_BATCH },
  };

  const [shopRows, officeRows, totalShops, totalOffices] = await Promise.all([
    prisma.property.findMany({
      where: shopWhere,
      select: { title: true, type: true, financialPriceUnit: true, price: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.findMany({
      where: officeWhere,
      select: { title: true, type: true, financialPriceUnit: true, price: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where: buildPropertyWhere({ category: "lease", type: "Shop" }) }),
    prisma.property.count({
      where: buildPropertyWhere({ category: "lease", type: "Office Space" }),
    }),
  ]);

  console.log("[seed-rent-pdf] Filter verification:");
  console.log(`  /lease Shops:   ${totalShops} total, ${shopRows.length} from PDF`);
  console.log(`  /lease Offices: ${totalOffices} total, ${officeRows.length} from PDF`);

  console.log("\n  --- Shops ---");
  for (const row of shopRows) {
    const ok = row.type === "Shop" && row.financialPriceUnit === "month";
    console.log(`  ${ok ? "PASS" : "FAIL"} | ${row.title} | ₹${row.price}/mo`);
  }

  console.log("\n  --- Offices ---");
  for (const row of officeRows) {
    const ok = row.type === "Office_Space" && row.financialPriceUnit === "month";
    console.log(`  ${ok ? "PASS" : "FAIL"} | ${row.title} | ₹${row.price}/mo`);
  }

  if (shopRows.length < rentShopListings.length || officeRows.length < rentOfficeListings.length) {
    process.exitCode = 1;
  }
}

async function main() {
  if (!process.env.DATABASE_URL?.startsWith("postgresql://")) {
    console.error("[seed-rent-pdf] DATABASE_URL must be postgresql://");
    process.exit(1);
  }

  const admin = await prisma.user.findFirst({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, role: true },
  });
  if (!admin) {
    console.error(`[seed-rent-pdf] Admin user not found: ${ADMIN_EMAIL}`);
    process.exit(1);
  }

  const purged = await purgeTempListings({ keepRentPdfSeeds: true });
  console.log(`[seed-rent-pdf] Purged ${purged} legacy temporary listing(s)`);

  await seedBatch({
    batchTag: SHOP_BATCH,
    listings: rentShopListings,
    force: FORCE_SHOPS,
    label: "Shops",
    sellerUuid: admin.id,
  });

  await seedBatch({
    batchTag: OFFICE_BATCH,
    listings: rentOfficeListings,
    force: FORCE_OFFICES,
    label: "Offices",
    sellerUuid: admin.id,
  });

  invalidatePrefix("properties");
  await printReport();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[seed-rent-pdf] Failed:", err.message);
  prisma.$disconnect().finally(() => process.exit(1));
});
