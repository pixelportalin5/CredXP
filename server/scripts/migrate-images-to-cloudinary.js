#!/usr/bin/env node
/**
 * Migrates inline base64 images in MongoDB to Cloudinary URLs.
 * Safe to run multiple times (idempotent). Supports --dry-run.
 *
 * Usage:
 *   node scripts/migrate-images-to-cloudinary.js
 *   node scripts/migrate-images-to-cloudinary.js --dry-run
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Property = require("../src/models/Property");
const CoworkingSpace = require("../src/models/CoworkingSpace");
const User = require("../src/models/User");
const Proposal = require("../src/models/Proposal");
const imageUploadService = require("../src/services/imageUploadService");

const DRY_RUN = process.argv.includes("--dry-run");
const REPORT_PATH = path.join(__dirname, "migrate-images-report.json");

const report = {
  startedAt: new Date().toISOString(),
  dryRun: DRY_RUN,
  collections: {},
  totals: { scanned: 0, migrated: 0, skipped: 0, failed: 0 },
  failures: [],
  finishedAt: null,
};

function log(message) {
  console.log(`[migrate-images] ${message}`);
}

function track(collection, key, delta = 1) {
  if (!report.collections[collection]) {
    report.collections[collection] = { scanned: 0, migrated: 0, skipped: 0, failed: 0 };
  }
  report.collections[collection][key] += delta;
  report.totals[key] += delta;
}

async function migrateValue(value, category) {
  if (!value || typeof value !== "string") {
    return { changed: false, value, publicId: "" };
  }

  if (imageUploadService.isAlreadyMigrated(value)) {
    return {
      changed: false,
      value,
      publicId:
        imageUploadService.extractPublicIdFromUrl(value) || "",
      skipped: true,
    };
  }

  if (!imageUploadService.isBase64DataUrl(value)) {
    return { changed: false, value, publicId: "", skipped: true };
  }

  if (DRY_RUN) {
    return { changed: true, value: `[dry-run] cloudinary://${category}`, publicId: "[dry-run]" };
  }

  const uploaded = await imageUploadService.uploadDataUrl(value, category);
  return { changed: true, value: uploaded.imageUrl, publicId: uploaded.publicId };
}

async function migrateStringArray(values, category) {
  const urls = [];
  const publicIds = [];
  let changed = false;

  for (const item of values || []) {
    const result = await migrateValue(item, category);
    urls.push(result.value);
    publicIds.push(result.publicId || "");
    if (result.changed) changed = true;
  }

  return { changed, urls, publicIds };
}

async function migrateProperty(doc) {
  track("properties", "scanned");
  const updates = {};
  let changed = false;

  if (Array.isArray(doc.images) && doc.images.length > 0) {
    const migrated = await migrateStringArray(doc.images, "property");
    if (migrated.changed) {
      updates.images = migrated.urls;
      updates.imagePublicIds = migrated.publicIds;
      updates.coverImagePublicId = migrated.publicIds[0] || doc.coverImagePublicId || "";
      const coverNeedsReplace =
        !doc.coverImage || imageUploadService.isBase64DataUrl(doc.coverImage);
      if (coverNeedsReplace && migrated.urls[0]) {
        updates.coverImage = migrated.urls[0];
      }
      changed = true;
    }
  }

  if (doc.coverImage) {
    const cover = await migrateValue(doc.coverImage, "property");
    if (cover.changed) {
      updates.coverImage = cover.value;
      updates.coverImagePublicId = cover.publicId || updates.coverImagePublicId || "";
      changed = true;
    }
  }

  if (!changed) {
    track("properties", "skipped");
    return;
  }

  if (DRY_RUN) {
    log(`[dry-run] would update Property ${doc._id}`);
    track("properties", "migrated");
    return;
  }

  await Property.updateOne({ _id: doc._id }, { $set: updates });
  log(`updated Property ${doc._id}`);
  track("properties", "migrated");
}

async function migrateCoworking(doc) {
  track("coworking", "scanned");
  const updates = {};
  let changed = false;

  if (Array.isArray(doc.images) && doc.images.length > 0) {
    const migrated = await migrateStringArray(doc.images, "coworking");
    if (migrated.changed) {
      updates.images = migrated.urls;
      updates.imagePublicIds = migrated.publicIds;
      updates.coverImagePublicId = migrated.publicIds[0] || doc.coverImagePublicId || "";
      const coverNeedsReplace =
        !doc.coverImage || imageUploadService.isBase64DataUrl(doc.coverImage);
      if (coverNeedsReplace && migrated.urls[0]) {
        updates.coverImage = migrated.urls[0];
      }
      changed = true;
    }
  }

  if (doc.coverImage) {
    const cover = await migrateValue(doc.coverImage, "coworking");
    if (cover.changed) {
      updates.coverImage = cover.value;
      updates.coverImagePublicId = cover.publicId || updates.coverImagePublicId || "";
      changed = true;
    }
  }

  if (!changed) {
    track("coworking", "skipped");
    return;
  }

  if (DRY_RUN) {
    log(`[dry-run] would update CoworkingSpace ${doc._id}`);
    track("coworking", "migrated");
    return;
  }

  await CoworkingSpace.updateOne({ _id: doc._id }, { $set: updates });
  log(`updated CoworkingSpace ${doc._id}`);
  track("coworking", "migrated");
}

async function migrateUser(doc) {
  track("users", "scanned");

  if (!doc.avatar) {
    track("users", "skipped");
    return;
  }

  const migrated = await migrateValue(doc.avatar, "avatar");
  if (!migrated.changed) {
    track("users", "skipped");
    return;
  }

  if (DRY_RUN) {
    log(`[dry-run] would update User ${doc._id}`);
    track("users", "migrated");
    return;
  }

  await User.updateOne(
    { _id: doc._id },
    { $set: { avatar: migrated.value, avatarPublicId: migrated.publicId || "" } }
  );
  log(`updated User ${doc._id}`);
  track("users", "migrated");
}

async function migrateProposal(doc) {
  track("proposals", "scanned");
  const updates = {};
  let changed = false;

  if (doc.coverImage) {
    const cover = await migrateValue(doc.coverImage, "proposal");
    if (cover.changed) {
      updates.coverImage = cover.value;
      updates.coverImagePublicId = cover.publicId || "";
      changed = true;
    }
  }

  if (doc.agent?.avatar) {
    const avatar = await migrateValue(doc.agent.avatar, "avatar");
    if (avatar.changed) {
      updates["agent.avatar"] = avatar.value;
      updates["agent.avatarPublicId"] = avatar.publicId || "";
      changed = true;
    }
  }

  if (!changed) {
    track("proposals", "skipped");
    return;
  }

  if (DRY_RUN) {
    log(`[dry-run] would update Proposal ${doc._id}`);
    track("proposals", "migrated");
    return;
  }

  await Proposal.updateOne({ _id: doc._id }, { $set: updates });
  log(`updated Proposal ${doc._id}`);
  track("proposals", "migrated");
}

async function runCollection(Model, name, handler) {
  const cursor = Model.find().cursor();
  for await (const doc of cursor) {
    try {
      await handler(doc);
    } catch (error) {
      track(name, "failed");
      const failure = {
        collection: name,
        id: String(doc._id),
        message: error.message || String(error),
      };
      report.failures.push(failure);
      log(`FAILED ${name} ${doc._id}: ${failure.message}`);
    }
  }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("[migrate-images] MONGODB_URI is required");
    process.exit(1);
  }

  if (!DRY_RUN) {
    const { requireCloudinaryEnv } = require("../src/config/cloudinary");
    requireCloudinaryEnv();
  }

  log(DRY_RUN ? "Starting dry-run" : "Starting migration");
  await mongoose.connect(process.env.MONGODB_URI);

  await runCollection(Property, "properties", migrateProperty);
  await runCollection(CoworkingSpace, "coworking", migrateCoworking);
  await runCollection(User, "users", migrateUser);
  await runCollection(Proposal, "proposals", migrateProposal);

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  log("Done");
  log(`scanned=${report.totals.scanned} migrated=${report.totals.migrated} skipped=${report.totals.skipped} failed=${report.totals.failed}`);
  log(`report written to ${REPORT_PATH}`);

  await mongoose.disconnect();
  process.exit(report.totals.failed > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error("[migrate-images] Fatal error:", error);
  report.failures.push({ collection: "fatal", id: null, message: error.message || String(error) });
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
