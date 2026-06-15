#!/usr/bin/env node
/**
 * Validate June 2026 rent PDF shop listings appear under /lease (Shop filter).
 */

require("dotenv").config();

const prisma = require("../src/lib/prisma");
const { buildPropertyWhere } = require("../src/lib/prisma/propertyQuery");
const { SEED_BATCH, rentShopListings } = require("../src/seed/data/june2026RentShops");

async function main() {
  const where = {
    ...buildPropertyWhere({ category: "lease", type: "Shop" }),
    highlights: { has: SEED_BATCH },
  };

  const rows = await prisma.property.findMany({
    where,
    select: { title: true, type: true, financialPriceUnit: true, price: true, buildingName: true },
    orderBy: { createdAt: "desc" },
  });

  let fail = 0;
  console.log(`\n=== Lease shops from PDF (${rows.length}) ===`);
  for (const row of rows) {
    const ok = row.type === "Shop" && row.financialPriceUnit === "month";
    if (!ok) fail += 1;
    console.log(`${ok ? "PASS" : "FAIL"} | ₹${row.price}/mo | ${row.title}`);
  }

  if (rows.length < 10 || rows.length > 12) {
    console.error(`\nExpected 10-12 shops, got ${rows.length}`);
    fail += 1;
  }

  const expectedBuildings = new Set(rentShopListings.map((l) => l.buildingName));
  const missing = [...expectedBuildings].filter(
    (name) => !rows.some((r) => r.buildingName === name)
  );
  if (missing.length) {
    console.error(`\nMissing buildings: ${missing.join(", ")}`);
    fail += 1;
  }

  await prisma.$disconnect();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
