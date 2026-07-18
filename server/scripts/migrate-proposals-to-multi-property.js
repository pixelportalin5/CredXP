#!/usr/bin/env node
/**
 * One-time backfill: converts proposals stored in the old single-property
 * shape (top-level propertyId/propertyTitle/propertySnapshot/coverImage/
 * overviewFields/detailFields/agentResearch) into the new multi-property
 * shape (a `properties` array with one entry per property).
 *
 * Safe to run multiple times (idempotent) — documents that already have a
 * `properties` array are skipped. Supports --dry-run.
 *
 * Usage:
 *   node scripts/migrate-proposals-to-multi-property.js --dry-run
 *   node scripts/migrate-proposals-to-multi-property.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");

const DRY_RUN = process.argv.includes("--dry-run");

function log(message) {
  console.log(`[migrate-proposals] ${message}`);
}

function buildPropertyEntry(doc) {
  return {
    propertyId: doc.propertyId,
    propertyTitle: doc.propertyTitle,
    propertyType: doc.propertyType,
    propertySnapshot: doc.propertySnapshot,
    coverImage: doc.coverImage,
    coverImagePublicId: doc.coverImagePublicId || "",
    overviewFields: doc.overviewFields,
    detailFields: doc.detailFields,
    agentResearch: doc.agentResearch,
  };
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("[migrate-proposals] MONGODB_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  log(`Connected${DRY_RUN ? " (dry-run)" : ""}`);

  const collection = mongoose.connection.db.collection("proposals");

  const cursor = collection.find({
    properties: { $exists: false },
    propertyId: { $exists: true },
  });

  let scanned = 0;
  let migrated = 0;
  let failed = 0;

  for await (const doc of cursor) {
    scanned += 1;
    try {
      const entry = buildPropertyEntry(doc);
      if (!entry.propertyId || !entry.propertyTitle || !entry.propertySnapshot) {
        log(`SKIP ${doc._id}: missing required fields for migration`);
        continue;
      }

      const update = {
        $set: { properties: [entry] },
        $unset: {
          propertyId: "",
          propertyTitle: "",
          propertyType: "",
          propertySnapshot: "",
          coverImage: "",
          coverImagePublicId: "",
          overviewFields: "",
          detailFields: "",
          agentResearch: "",
        },
      };

      if (DRY_RUN) {
        log(`[dry-run] would migrate proposal ${doc._id} (${entry.propertyTitle})`);
      } else {
        await collection.updateOne({ _id: doc._id }, update);
        log(`migrated proposal ${doc._id} (${entry.propertyTitle})`);
      }
      migrated += 1;
    } catch (error) {
      failed += 1;
      console.error(`[migrate-proposals] FAILED ${doc._id}:`, error.message);
    }
  }

  log(`Done. Scanned: ${scanned}, migrated: ${migrated}, failed: ${failed}`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("[migrate-proposals] Fatal error:", error);
  process.exit(1);
});
