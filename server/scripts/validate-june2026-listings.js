#!/usr/bin/env node
/**
 * Validate June 2026 PDF seed listings appear in correct invest/lease filters.
 */

require("dotenv").config();

const prisma = require("../src/lib/prisma");
const { buildPropertyWhere } = require("../src/lib/prisma/propertyQuery");
const { SEED_BUILDING_NAMES } = require("../src/seed/data/june2026PdfListings");

async function main() {
  const seedWhere = { buildingName: { in: SEED_BUILDING_NAMES } };
  const investWhere = {
    ...buildPropertyWhere({ category: "investment" }),
    ...seedWhere,
  };
  const leaseWhere = {
    ...buildPropertyWhere({ category: "lease" }),
    ...seedWhere,
  };

  const [investRows, leaseRows] = await Promise.all([
    prisma.property.findMany({
      where: investWhere,
      select: {
        title: true,
        type: true,
        financialPriceUnit: true,
        price: true,
        size: true,
        financialRentalYield: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.findMany({
      where: leaseWhere,
      select: {
        title: true,
        type: true,
        financialPriceUnit: true,
        price: true,
        size: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let fail = 0;

  console.log(`\n=== Invest listings (${investRows.length}) ===`);
  for (const row of investRows) {
    const ok =
      !["month", "year"].includes(row.financialPriceUnit) &&
      ["Pre_Leased_Office", "Shop", "Retail_SCO"].includes(row.type);
    if (!ok) fail += 1;
    console.log(`${ok ? "PASS" : "FAIL"} | ${row.type} | ${row.financialPriceUnit} | ${row.title}`);
  }

  console.log(`\n=== Lease listings (${leaseRows.length}) ===`);
  for (const row of leaseRows) {
    const ok =
      ["month", "year"].includes(row.financialPriceUnit) &&
      ["Office_Space", "Shop"].includes(row.type);
    if (!ok) fail += 1;
    console.log(`${ok ? "PASS" : "FAIL"} | ${row.type} | ${row.financialPriceUnit} | ₹${row.price}/mo | ${row.title}`);
  }

  const legacyTagged = await prisma.property.count({
    where: { title: { startsWith: "GGN-JUN26" } },
  });
  if (legacyTagged > 0) {
    console.error(`\n${legacyTagged} listing(s) still use legacy GGN-JUN26 title prefix`);
    fail += 1;
  }

  if (investRows.length !== 10 || leaseRows.length !== 10) {
    console.error(`\nExpected 10+10 listings, got ${investRows.length}+${leaseRows.length}`);
    fail += 1;
  }

  await prisma.$disconnect();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
