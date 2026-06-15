#!/usr/bin/env node
/**
 * Assign all published active properties to admin@gmail.com
 */
require("dotenv").config();

const prisma = require("../src/lib/prisma");
const { invalidatePrefix } = require("../src/utils/queryCache");

const ADMIN_EMAIL = "admin@gmail.com";

async function main() {
  const admin = await prisma.user.findFirst({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, role: true },
  });

  if (!admin) {
    console.error(`[assign-admin] User not found: ${ADMIN_EMAIL}`);
    process.exit(1);
  }

  if (admin.role !== "admin") {
    console.warn(`[assign-admin] WARN: ${ADMIN_EMAIL} role is ${admin.role}, expected admin`);
  }

  const result = await prisma.property.updateMany({
    where: {
      OR: [{ sellerId: null }, { sellerId: { not: admin.id } }],
    },
    data: { sellerId: admin.id },
  });

  invalidatePrefix("properties");

  const [total, adminOwned] = await Promise.all([
    prisma.property.count({ where: { isActive: true, listingStatus: "published" } }),
    prisma.property.count({
      where: { isActive: true, listingStatus: "published", sellerId: admin.id },
    }),
  ]);

  console.log(`[assign-admin] Updated ${result.count} property row(s) to seller ${ADMIN_EMAIL}`);
  console.log(`[assign-admin] Live listings: ${total}, admin-owned: ${adminOwned}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[assign-admin] Failed:", err.message);
  process.exit(1);
});
