#!/usr/bin/env node
/**
 * Validates MongoDB → PostgreSQL migration (Phase 3A).
 * Checks row counts, FK integrity, legacy_mongo_id coverage, and schema presence.
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const prisma = require("../src/lib/prisma");

const User = require("../src/models/User");
const Property = require("../src/models/Property");
const CoworkingSpace = require("../src/models/CoworkingSpace");
const Enquiry = require("../src/models/Enquiry");
const Proposal = require("../src/models/Proposal");
const SavedProperty = require("../src/models/SavedProperty");
const ContactMessage = require("../src/models/ContactMessage");
const AuditLog = require("../src/models/AuditLog");

const REPORT_PATH = path.join(__dirname, "validate-migration-report.json");

const COLLECTIONS = [
  { name: "users", mongoModel: User, prismaCount: () => prisma.user.count() },
  { name: "properties", mongoModel: Property, prismaCount: () => prisma.property.count() },
  { name: "coworking_spaces", mongoModel: CoworkingSpace, prismaCount: () => prisma.coworkingSpace.count() },
  { name: "enquiries", mongoModel: Enquiry, prismaCount: () => prisma.enquiry.count() },
  { name: "proposals", mongoModel: Proposal, prismaCount: () => prisma.proposal.count() },
  { name: "saved_properties", mongoModel: SavedProperty, prismaCount: () => prisma.savedProperty.count() },
  { name: "contact_messages", mongoModel: ContactMessage, prismaCount: () => prisma.contactMessage.count() },
  { name: "audit_logs", mongoModel: AuditLog, prismaCount: () => prisma.auditLog.count() },
];

const report = {
  startedAt: new Date().toISOString(),
  rowCounts: {},
  fkIntegrity: [],
  schemaChecks: [],
  legacyMongoIdChecks: [],
  passed: true,
  finishedAt: null,
};

function fail(section, message) {
  report.passed = false;
  section.push({ ok: false, message });
}

function pass(section, message) {
  section.push({ ok: true, message });
}

async function validateRowCounts() {
  for (const collection of COLLECTIONS) {
    const mongoCount = await collection.mongoModel.countDocuments();
    const postgresCount = await collection.prismaCount();
    const match = mongoCount === postgresCount;

    report.rowCounts[collection.name] = { mongo: mongoCount, postgres: postgresCount, match };

    if (match) {
      pass(report.schemaChecks, `${collection.name}: counts match (${mongoCount})`);
    } else {
      fail(
        report.schemaChecks,
        `${collection.name}: count mismatch mongo=${mongoCount} postgres=${postgresCount}`
      );
    }
  }
}

async function validateLegacyMongoIds() {
  for (const collection of COLLECTIONS) {
    const delegate = {
      users: prisma.user,
      properties: prisma.property,
      coworking_spaces: prisma.coworkingSpace,
      enquiries: prisma.enquiry,
      proposals: prisma.proposal,
      saved_properties: prisma.savedProperty,
      contact_messages: prisma.contactMessage,
      audit_logs: prisma.auditLog,
    }[collection.name];

    const missingLegacy = await delegate.count({ where: { legacyMongoId: "" } });
    const total = await delegate.count();

    if (missingLegacy === 0) {
      pass(report.legacyMongoIdChecks, `${collection.name}: all ${total} rows have legacy_mongo_id`);
    } else {
      fail(
        report.legacyMongoIdChecks,
        `${collection.name}: ${missingLegacy}/${total} rows missing legacy_mongo_id`
      );
    }
  }
}

async function validateForeignKeys() {
  const checks = [
    {
      label: "properties.seller_id → users.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM properties p
        WHERE p.seller_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p.seller_id)
      `,
    },
    {
      label: "coworking_spaces.seller_id → users.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM coworking_spaces c
        WHERE c.seller_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = c.seller_id)
      `,
    },
    {
      label: "enquiries.property_id → properties.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM enquiries e
        WHERE e.property_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM properties p WHERE p.id = e.property_id)
      `,
    },
    {
      label: "enquiries.coworking_space_id → coworking_spaces.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM enquiries e
        WHERE e.coworking_space_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM coworking_spaces c WHERE c.id = e.coworking_space_id)
      `,
    },
    {
      label: "enquiries.user_id → users.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM enquiries e
        WHERE e.user_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = e.user_id)
      `,
    },
    {
      label: "proposals.created_by_id → users.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM proposals pr
        WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = pr.created_by_id)
      `,
    },
    {
      label: "proposals.property_id → properties.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM proposals pr
        WHERE NOT EXISTS (SELECT 1 FROM properties p WHERE p.id = pr.property_id)
      `,
    },
    {
      label: "saved_properties.user_id → users.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM saved_properties sp
        WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = sp.user_id)
      `,
    },
    {
      label: "saved_properties.property_id → properties.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM saved_properties sp
        WHERE NOT EXISTS (SELECT 1 FROM properties p WHERE p.id = sp.property_id)
      `,
    },
    {
      label: "audit_logs.actor_id → users.id",
      sql: `
        SELECT COUNT(*)::int AS count
        FROM audit_logs a
        WHERE a.actor_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = a.actor_id)
      `,
    },
  ];

  for (const check of checks) {
    const result = await prisma.$queryRawUnsafe(check.sql);
    const orphans = Number(result[0]?.count || 0);

    if (orphans === 0) {
      pass(report.fkIntegrity, `${check.label}: OK`);
    } else {
      fail(report.fkIntegrity, `${check.label}: ${orphans} orphan row(s)`);
    }
  }
}

async function validateSchemaTables() {
  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  const expected = [
    "audit_logs",
    "contact_messages",
    "coworking_spaces",
    "enquiries",
    "migration_checkpoints",
    "properties",
    "proposals",
    "saved_properties",
    "users",
  ];

  const found = tables.map((row) => row.table_name);
  const missing = expected.filter((name) => !found.includes(name));

  if (missing.length === 0) {
    pass(report.schemaChecks, `All ${expected.length} expected tables present`);
  } else {
    fail(report.schemaChecks, `Missing tables: ${missing.join(", ")}`);
  }
}

async function main() {
  if (!process.env.MONGODB_URI || !process.env.DATABASE_URL) {
    console.error("[validate-migration] MONGODB_URI and DATABASE_URL are required");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await prisma.$queryRaw`SELECT 1`;

  console.log("[validate-migration] Checking PostgreSQL schema...");
  await validateSchemaTables();

  console.log("[validate-migration] Comparing row counts...");
  await validateRowCounts();

  console.log("[validate-migration] Checking legacy_mongo_id coverage...");
  await validateLegacyMongoIds();

  console.log("[validate-migration] Checking FK integrity...");
  await validateForeignKeys();

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n[validate-migration] ${report.passed ? "PASSED" : "FAILED"}`);
  console.log(`[validate-migration] report: ${REPORT_PATH}\n`);

  await mongoose.disconnect();
  await prisma.$disconnect();
  process.exit(report.passed ? 0 : 1);
}

main().catch(async (error) => {
  console.error("[validate-migration] Fatal:", error);
  report.passed = false;
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  await mongoose.disconnect().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
