#!/usr/bin/env node
/**
 * Phase 5B — Sync migrated image fields from MongoDB → PostgreSQL.
 * Updates only image-related columns (idempotent).
 *
 * Usage:
 *   node scripts/sync-images-mongo-to-postgres.js
 *   node scripts/sync-images-mongo-to-postgres.js --dry-run
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const prisma = require("../src/lib/prisma");
const Property = require("../src/models/Property");
const CoworkingSpace = require("../src/models/CoworkingSpace");
const User = require("../src/models/User");
const Proposal = require("../src/models/Proposal");

const DRY_RUN = process.argv.includes("--dry-run");
const REPORT_PATH = path.join(__dirname, "sync-images-mongo-report.json");

const report = {
  startedAt: new Date().toISOString(),
  dryRun: DRY_RUN,
  collections: {},
  totals: { scanned: 0, synced: 0, missing: 0, failed: 0 },
  failures: [],
  finishedAt: null,
};

function log(message) {
  console.log(`[sync-images] ${message}`);
}

function track(collection, key, delta = 1) {
  if (!report.collections[collection]) {
    report.collections[collection] = { scanned: 0, synced: 0, missing: 0, failed: 0 };
  }
  report.collections[collection][key] += delta;
  report.totals[key] += delta;
}

async function syncProperties() {
  const docs = await Property.find({}).lean();
  for (const doc of docs) {
    track("properties", "scanned");
    try {
      const existing = await prisma.property.findUnique({
        where: { legacyMongoId: String(doc._id) },
        select: { id: true },
      });
      if (!existing) {
        track("properties", "missing");
        log(`SKIP property ${doc._id} — not in PostgreSQL`);
        continue;
      }

      const data = {
        images: Array.isArray(doc.images) ? doc.images.map(String) : [],
        imagePublicIds: Array.isArray(doc.imagePublicIds) ? doc.imagePublicIds.map(String) : [],
        coverImage: doc.coverImage ? String(doc.coverImage) : "",
        coverImagePublicId: doc.coverImagePublicId ? String(doc.coverImagePublicId) : "",
      };

      if (!DRY_RUN) {
        await prisma.property.update({ where: { id: existing.id }, data });
      }
      track("properties", "synced");
      log(`${DRY_RUN ? "[dry-run] would sync" : "synced"} property ${doc._id}`);
    } catch (error) {
      track("properties", "failed");
      report.failures.push({
        collection: "properties",
        id: String(doc._id),
        message: error.message || String(error),
      });
      log(`FAILED property ${doc._id}: ${error.message}`);
    }
  }
}

async function syncCoworking() {
  const docs = await CoworkingSpace.find({}).lean();
  for (const doc of docs) {
    track("coworking", "scanned");
    try {
      const existing = await prisma.coworkingSpace.findUnique({
        where: { legacyMongoId: String(doc._id) },
        select: { id: true },
      });
      if (!existing) {
        track("coworking", "missing");
        continue;
      }

      const data = {
        images: Array.isArray(doc.images) ? doc.images.map(String) : [],
        imagePublicIds: Array.isArray(doc.imagePublicIds) ? doc.imagePublicIds.map(String) : [],
        coverImage: doc.coverImage ? String(doc.coverImage) : "",
        coverImagePublicId: doc.coverImagePublicId ? String(doc.coverImagePublicId) : "",
      };

      if (!DRY_RUN) {
        await prisma.coworkingSpace.update({ where: { id: existing.id }, data });
      }
      track("coworking", "synced");
    } catch (error) {
      track("coworking", "failed");
      report.failures.push({
        collection: "coworking",
        id: String(doc._id),
        message: error.message || String(error),
      });
    }
  }
}

async function syncUsers() {
  const docs = await User.find({}).lean();
  for (const doc of docs) {
    track("users", "scanned");
    try {
      const existing = await prisma.user.findUnique({
        where: { legacyMongoId: String(doc._id) },
        select: { id: true },
      });
      if (!existing) {
        track("users", "missing");
        continue;
      }

      const data = {
        avatar: doc.avatar ? String(doc.avatar) : null,
        avatarPublicId: doc.avatarPublicId ? String(doc.avatarPublicId) : "",
      };

      if (!DRY_RUN) {
        await prisma.user.update({ where: { id: existing.id }, data });
      }
      track("users", "synced");
    } catch (error) {
      track("users", "failed");
      report.failures.push({
        collection: "users",
        id: String(doc._id),
        message: error.message || String(error),
      });
    }
  }
}

async function syncProposals() {
  const docs = await Proposal.find({}).lean();
  for (const doc of docs) {
    track("proposals", "scanned");
    try {
      const existing = await prisma.proposal.findUnique({
        where: { legacyMongoId: String(doc._id) },
        select: { id: true },
      });
      if (!existing) {
        track("proposals", "missing");
        continue;
      }

      const data = {
        coverImage: doc.coverImage ? String(doc.coverImage) : null,
        coverImagePublicId: doc.coverImagePublicId ? String(doc.coverImagePublicId) : "",
        agent: doc.agent || {},
      };

      if (!DRY_RUN) {
        await prisma.proposal.update({ where: { id: existing.id }, data });
      }
      track("proposals", "synced");
    } catch (error) {
      track("proposals", "failed");
      report.failures.push({
        collection: "proposals",
        id: String(doc._id),
        message: error.message || String(error),
      });
    }
  }
}

async function main() {
  if (!process.env.MONGODB_URI || !process.env.DATABASE_URL) {
    console.error("[sync-images] MONGODB_URI and DATABASE_URL are required");
    process.exit(1);
  }

  log(DRY_RUN ? "Starting dry-run" : "Starting image field sync MongoDB → PostgreSQL");
  await mongoose.connect(process.env.MONGODB_URI);
  await prisma.$queryRaw`SELECT 1`;

  await syncProperties();
  await syncCoworking();
  await syncUsers();
  await syncProposals();

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  log("Done");
  log(
    `scanned=${report.totals.scanned} synced=${report.totals.synced} missing=${report.totals.missing} failed=${report.totals.failed}`
  );
  log(`report: ${REPORT_PATH}`);

  await mongoose.disconnect();
  await prisma.$disconnect();
  process.exit(report.totals.failed > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error("[sync-images] Fatal:", error);
  report.failures.push({ collection: "fatal", id: null, message: error.message || String(error) });
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  await mongoose.disconnect().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
