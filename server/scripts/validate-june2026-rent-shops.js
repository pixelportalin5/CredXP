#!/usr/bin/env node
/**
 * Validate June 2026 rent PDF shop + office listings under /lease filters.
 */

require("dotenv").config();

const prisma = require("../src/lib/prisma");
const { buildPropertyWhere } = require("../src/lib/prisma/propertyQuery");
const {
  SEED_BATCH: SHOP_BATCH,
  rentShopListings,
} = require("../src/seed/data/june2026RentShops");
const {
  SEED_BATCH: OFFICE_BATCH,
  rentOfficeListings,
} = require("../src/seed/data/june2026RentOffices");

async function validateBatch({ batch, type, expected, label }) {
  const prismaType = type === "Office Space" ? "Office_Space" : type;
  const where = {
    ...buildPropertyWhere({ category: "lease", type }),
    highlights: { has: batch },
  };

  const rows = await prisma.property.findMany({
    where,
    select: { title: true, type: true, financialPriceUnit: true, price: true, buildingName: true },
    orderBy: { createdAt: "desc" },
  });

  let fail = 0;
  console.log(`\n=== ${label} (${rows.length}) ===`);
  for (const row of rows) {
    const ok = row.type === prismaType && row.financialPriceUnit === "month";
    if (!ok) fail += 1;
    console.log(`${ok ? "PASS" : "FAIL"} | ₹${row.price}/mo | ${row.title}`);
  }

  if (rows.length !== expected.length) {
    console.error(`Expected ${expected.length} ${label.toLowerCase()}, got ${rows.length}`);
    fail += 1;
  }

  const expectedBuildings = new Set(expected.map((l) => l.buildingName));
  const missing = [...expectedBuildings].filter(
    (name) => !rows.some((r) => r.buildingName === name)
  );
  if (missing.length) {
    console.error(`Missing ${label.toLowerCase()}: ${missing.join(", ")}`);
    fail += 1;
  }

  return fail;
}

async function main() {
  const fail =
    (await validateBatch({
      batch: SHOP_BATCH,
      type: "Shop",
      expected: rentShopListings,
      label: "Lease shops from PDF",
    })) +
    (await validateBatch({
      batch: OFFICE_BATCH,
      type: "Office Space",
      expected: rentOfficeListings,
      label: "Lease offices from PDF",
    }));

  await prisma.$disconnect();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
