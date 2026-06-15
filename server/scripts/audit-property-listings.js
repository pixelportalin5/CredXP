#!/usr/bin/env node
require("dotenv").config();
const prisma = require("../src/lib/prisma");
const { buildPropertyWhere } = require("../src/lib/prisma/propertyQuery");

const ADMIN_EMAIL = "admin@gmail.com";

async function main() {
  const admin = await prisma.user.findFirst({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, role: true, name: true },
  });

  const [
    total,
    publishedActive,
    invest,
    lease,
    shops,
    offices,
    noSeller,
    notAdminSeller,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { isActive: true, listingStatus: "published" } }),
    prisma.property.count({ where: buildPropertyWhere({ category: "investment" }) }),
    prisma.property.count({ where: buildPropertyWhere({ category: "lease" }) }),
    prisma.property.count({ where: buildPropertyWhere({ category: "lease", type: "Shop" }) }),
    prisma.property.count({ where: buildPropertyWhere({ category: "lease", type: "Office Space" }) }),
    prisma.property.count({
      where: { isActive: true, listingStatus: "published", sellerId: null },
    }),
    admin
      ? prisma.property.count({
          where: {
            isActive: true,
            listingStatus: "published",
            sellerId: { not: admin.id },
          },
        })
      : 0,
  ]);

  const sellers = await prisma.property.groupBy({
    by: ["sellerId"],
    _count: { _all: true },
    where: { isActive: true, listingStatus: "published" },
  });

  const sellerDetails = await Promise.all(
    sellers.map(async (row) => {
      if (!row.sellerId) return { sellerId: null, email: "(none)", count: row._count._all };
      const user = await prisma.user.findUnique({
        where: { id: row.sellerId },
        select: { email: true, role: true, name: true },
      });
      return {
        sellerId: row.sellerId,
        email: user?.email || "unknown",
        role: user?.role,
        count: row._count._all,
      };
    })
  );

  console.log("\n=== Property listing audit ===");
  console.log("Admin user:", admin || "NOT FOUND");
  console.log("Total properties in DB:", total);
  console.log("Live on site (published + active):", publishedActive);
  console.log("  /invest (investment):", invest);
  console.log("  /lease (all):", lease);
  console.log("    Shops:", shops);
  console.log("    Offices:", offices);
  console.log("Without seller (admin unattributed):", noSeller);
  console.log("Not owned by admin@gmail.com:", notAdminSeller);
  console.log("\nBy seller:");
  for (const s of sellerDetails) {
    console.log(`  ${s.email} (${s.role || "n/a"}): ${s.count}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
