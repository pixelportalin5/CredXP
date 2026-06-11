#!/usr/bin/env node
/**
 * Historical migration: MongoDB → PostgreSQL (Phase 3A)
 * Idempotent via legacy_mongo_id upserts. Does not change API/runtime behavior.
 *
 * Usage:
 *   node scripts/migrate-mongo-to-postgres.js
 *   node scripts/migrate-mongo-to-postgres.js --dry-run
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const prisma = require("../src/lib/prisma");
const { IdMap } = require("./lib/idMap");
const {
  transformUser,
  transformProperty,
  transformCoworkingSpace,
  transformEnquiry,
  transformProposal,
  transformSavedProperty,
  transformContactMessage,
  transformAuditLog,
} = require("./lib/mongoTransforms");

const User = require("../src/models/User");
const Property = require("../src/models/Property");
const CoworkingSpace = require("../src/models/CoworkingSpace");
const Enquiry = require("../src/models/Enquiry");
const Proposal = require("../src/models/Proposal");
const SavedProperty = require("../src/models/SavedProperty");
const ContactMessage = require("../src/models/ContactMessage");
const AuditLog = require("../src/models/AuditLog");

const DRY_RUN = process.argv.includes("--dry-run");
const REPORT_PATH = path.join(__dirname, "migrate-mongo-report.json");

const maps = {
  user: new IdMap("users"),
  property: new IdMap("properties"),
  coworking: new IdMap("coworking_spaces"),
  enquiry: new IdMap("enquiries"),
  proposal: new IdMap("proposals"),
  savedProperty: new IdMap("saved_properties"),
  contactMessage: new IdMap("contact_messages"),
  auditLog: new IdMap("audit_logs"),
};

const report = {
  startedAt: new Date().toISOString(),
  dryRun: DRY_RUN,
  collections: {},
  totals: { scanned: 0, upserted: 0, failed: 0 },
  failures: [],
  finishedAt: null,
};

function log(message) {
  console.log(`[migrate-mongo] ${message}`);
}

function ensureCollectionStats(collection) {
  if (!report.collections[collection]) {
    report.collections[collection] = { scanned: 0, upserted: 0, failed: 0 };
  }
  return report.collections[collection];
}

function track(collection, key, delta = 1) {
  ensureCollectionStats(collection)[key] += delta;
  report.totals[key] += delta;
}

async function upsert(modelName, data) {
  if (DRY_RUN) return { dryRun: true };

  const { legacyMongoId, id, createdAt, updatedAt, ...rest } = data;

  return prisma[modelName].upsert({
    where: { legacyMongoId },
    create: data,
    update: {
      ...rest,
      updatedAt,
    },
  });
}

async function migrateCollection({ name, model, modelName, transform, select }) {
  log(`Migrating ${name}...`);
  ensureCollectionStats(name);

  let query = model.find({});
  if (select) query = query.select(select);
  const docs = await query.lean();

  if (docs.length === 0) {
    log(`${name}: no documents in MongoDB — skipping`);
  }

  for (const doc of docs) {
    track(name, "scanned");
    try {
      const payload = transform(doc);
      if (!payload || typeof payload !== "object") {
        throw new Error(`transform returned ${payload === undefined ? "undefined" : typeof payload}`);
      }
      await upsert(modelName, payload);
      track(name, "upserted");
    } catch (error) {
      track(name, "failed");
      const message = error.message || String(error);
      report.failures.push({
        collection: name,
        legacyMongoId: String(doc._id),
        message,
      });
      log(`FAILED ${name} ${doc._id}: ${message}`);
    }
  }

  const stats = ensureCollectionStats(name);
  log(`${name} done — scanned=${stats.scanned} upserted=${stats.upserted} failed=${stats.failed}`);
}

async function preAssignIds() {
  const users = await User.find({}).select("_id").lean();
  users.forEach((doc) => maps.user.assign(doc._id));

  const properties = await Property.find({}).select("_id seller").lean();
  properties.forEach((doc) => {
    maps.property.assign(doc._id);
    if (doc.seller && !maps.user.has(doc.seller)) {
      log(`WARN property ${doc._id} references missing seller ${doc.seller}`);
    }
  });

  const coworking = await CoworkingSpace.find({}).select("_id seller").lean();
  coworking.forEach((doc) => {
    maps.coworking.assign(doc._id);
    if (doc.seller && !maps.user.has(doc.seller)) {
      log(`WARN coworking ${doc._id} references missing seller ${doc.seller}`);
    }
  });

  const enquiries = await Enquiry.find({}).select("_id").lean();
  enquiries.forEach((doc) => maps.enquiry.assign(doc._id));

  const proposals = await Proposal.find({}).select("_id").lean();
  proposals.forEach((doc) => maps.proposal.assign(doc._id));

  const saved = await SavedProperty.find({}).select("_id").lean();
  saved.forEach((doc) => maps.savedProperty.assign(doc._id));

  const contacts = await ContactMessage.find({}).select("_id").lean();
  contacts.forEach((doc) => maps.contactMessage.assign(doc._id));

  const audits = await AuditLog.find({}).select("_id").lean();
  audits.forEach((doc) => maps.auditLog.assign(doc._id));
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("[migrate-mongo] MONGODB_URI is required");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("[migrate-mongo] DATABASE_URL is required (Neon PostgreSQL)");
    process.exit(1);
  }

  log(DRY_RUN ? "Starting dry-run" : "Starting MongoDB → PostgreSQL migration");
  await mongoose.connect(process.env.MONGODB_URI);
  await prisma.$queryRaw`SELECT 1`;

  await preAssignIds();

  await migrateCollection({
    name: "users",
    model: User,
    modelName: "user",
    select: "+password",
    transform: (doc) => transformUser(doc, maps.user),
  });

  await migrateCollection({
    name: "properties",
    model: Property,
    modelName: "property",
    transform: (doc) => transformProperty(doc, maps),
  });

  await migrateCollection({
    name: "coworking_spaces",
    model: CoworkingSpace,
    modelName: "coworkingSpace",
    transform: (doc) => transformCoworkingSpace(doc, maps),
  });

  await migrateCollection({
    name: "enquiries",
    model: Enquiry,
    modelName: "enquiry",
    transform: (doc) => transformEnquiry(doc, maps),
  });

  await migrateCollection({
    name: "proposals",
    model: Proposal,
    modelName: "proposal",
    transform: (doc) => transformProposal(doc, maps),
  });

  await migrateCollection({
    name: "saved_properties",
    model: SavedProperty,
    modelName: "savedProperty",
    transform: (doc) => transformSavedProperty(doc, maps),
  });

  await migrateCollection({
    name: "contact_messages",
    model: ContactMessage,
    modelName: "contactMessage",
    transform: (doc) => transformContactMessage(doc, maps.contactMessage),
  });

  await migrateCollection({
    name: "audit_logs",
    model: AuditLog,
    modelName: "auditLog",
    transform: (doc) => transformAuditLog(doc, maps),
  });

  if (!DRY_RUN) {
    await prisma.migrationCheckpoint.create({
      data: {
        phase: "3A",
        note: `mongo-to-postgres migration completed at ${new Date().toISOString()}`,
      },
    });
  }

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  log("Done");
  log(`totals: scanned=${report.totals.scanned} upserted=${report.totals.upserted} failed=${report.totals.failed}`);
  log("collections summary:");
  for (const [collection, stats] of Object.entries(report.collections)) {
    log(`  ${collection}: scanned=${stats.scanned} upserted=${stats.upserted} failed=${stats.failed}`);
  }
  log(`report: ${REPORT_PATH}`);

  await mongoose.disconnect();
  await prisma.$disconnect();
  process.exit(report.totals.failed > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error("[migrate-mongo] Fatal:", error);
  report.failures.push({ collection: "fatal", legacyMongoId: null, message: error.message || String(error) });
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  await mongoose.disconnect().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
