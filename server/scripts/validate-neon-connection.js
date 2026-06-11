#!/usr/bin/env node
/**
 * Neon / PostgreSQL connectivity check (Phase 1).
 * Runs SELECT 1 via Prisma — does not migrate data or touch Mongoose.
 */

require("dotenv").config();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("[validate-neon] DATABASE_URL is not set. Copy server/.env.example to .env");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL.startsWith("postgresql://")) {
    console.error("[validate-neon] DATABASE_URL must be a postgresql:// connection string");
    process.exit(1);
  }

  let prisma;
  try {
    prisma = require("../src/lib/prisma");
    await prisma.$queryRaw`SELECT 1 AS ok`;
    console.log("[validate-neon] OK — PostgreSQL reachable");

    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`[validate-neon] Public tables: ${tables.length}`);
  } catch (err) {
    console.error("[validate-neon] FAILED");
    console.error(err.message || err);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

main();
