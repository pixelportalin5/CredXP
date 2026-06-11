#!/usr/bin/env node
/**
 * Validates Prisma service parity against Mongo implementations (read-only checks).
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

// Ensure Mongoose models are registered for populate() in mongo services.
require("../src/models/User");
require("../src/models/Property");
require("../src/models/CoworkingSpace");
require("../src/models/Enquiry");
require("../src/models/Proposal");
require("../src/models/SavedProperty");
require("../src/models/ContactMessage");
require("../src/models/AuditLog");

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const prisma = require("../src/lib/prisma");
const { compareResults } = require("./lib/compareResults");
const { sameId, checkFields, result } = require("./lib/semanticCompare");

const REPORT_PATH = path.join(__dirname, "validate-service-modules-report.json");

const MODULES = [
  {
    name: "contactMessage",
    mongo: () => require("../src/services/contactService.mongo"),
    prisma: () => require("../src/services/contactService.prisma"),
    tests: async (mongo, pg) => {
      const listMongo = await mongo.list({ limit: 5 });
      const listPg = await pg.list({ limit: 5 });
      const firstMongo = listMongo[0];
      const firstPg = listPg[0];
      return [
        { op: "list", ...compareResults(listMongo.length, listPg.length) },
        firstMongo && firstPg
          ? result(
              checkFields(await mongo.getById(firstMongo._id), await pg.getById(firstPg._id), [
                "_id",
                "fullName",
                "email",
              ]),
              "getById"
            )
          : result(true, "getById", { note: "no rows to compare" }),
      ];
    },
  },
  {
    name: "savedProperty",
    mongo: () => require("../src/services/savedPropertyService.mongo"),
    prisma: () => require("../src/services/savedPropertyService.prisma"),
    tests: async (mongo, pg) => {
      const SavedProperty = require("../src/models/SavedProperty");
      const sample = await SavedProperty.findOne().lean();
      if (!sample) return [{ op: "list", match: true, note: "no saved properties" }];
      const userId = String(sample.userId);
      return [
        { op: "list", ...compareResults((await mongo.list(userId)).length, (await pg.list(userId)).length) },
        result(sameId(await mongo.getById(sample._id), await pg.getById(String(sample._id))), "getById"),
      ];
    },
  },
  {
    name: "auditLog",
    mongo: () => require("../src/services/auditLogService.mongo"),
    prisma: () => require("../src/services/auditLogService.prisma"),
    tests: async (mongo, pg) => {
      const listMongo = await mongo.list({ limit: 5 });
      const listPg = await pg.list({ limit: 5 });
      const firstMongo = listMongo[0];
      const firstPg = listPg[0];
      return [
        { op: "list", ...compareResults(listMongo.length, listPg.length) },
        firstMongo && firstPg
          ? result(
              checkFields(await mongo.getById(firstMongo._id), await pg.getById(firstPg._id), [
                "_id",
                "action",
                "entityType",
              ]),
              "getById"
            )
          : result(true, "getById", { note: "no rows" }),
      ];
    },
  },
  {
    name: "user",
    mongo: () => require("../src/services/authService.mongo"),
    prisma: () => require("../src/services/authService.prisma"),
    tests: async (mongo, pg) => {
      const User = require("../src/models/User");
      const sample = await User.findOne().lean();
      if (!sample) return [{ op: "list", match: true, note: "no users" }];
      return [
        { op: "list", ...compareResults((await mongo.list({ limit: 5 })).length, (await pg.list({ limit: 5 })).length) },
        result(
          checkFields(await mongo.getById(sample._id), await pg.getById(sample._id), ["_id", "email", "name", "role"]),
          "getById"
        ),
      ];
    },
  },
  {
    name: "coworkingSpace",
    mongo: () => require("../src/services/coworkingService.mongo"),
    prisma: () => require("../src/services/coworkingService.prisma"),
    tests: async (mongo, pg) => {
      const listMongo = await mongo.getAll({ page: 1, limit: 5 });
      const listPg = await pg.getAll({ page: 1, limit: 5 });
      const id = listMongo.spaces[0]?._id;
      return [
        { op: "list", ...compareResults(listMongo.spaces.length, listPg.spaces.length) },
        id
          ? result(
              checkFields(await mongo.getById(id), await pg.getById(id), ["_id", "title", "operator"]),
              "getById"
            )
          : result(true, "getById", { note: "no rows" }),
      ];
    },
  },
  {
    name: "property",
    mongo: () => require("../src/services/propertyService.mongo"),
    prisma: () => require("../src/services/propertyService.prisma"),
    tests: async (mongo, pg) => {
      const listMongo = await mongo.getAll({ page: 1, limit: 5 });
      const listPg = await pg.getAll({ page: 1, limit: 5 });
      const id = listMongo.properties[0]?._id;
      return [
        { op: "list", ...compareResults(listMongo.properties.length, listPg.properties.length) },
        id
          ? result(
              checkFields(await mongo.getById(id), await pg.getById(id), ["_id", "title", "price"]),
              "getById"
            )
          : result(true, "getById", { note: "no rows" }),
      ];
    },
  },
  {
    name: "proposal",
    mongo: () => require("../src/services/proposalService.mongo"),
    prisma: () => require("../src/services/proposalService.prisma"),
    tests: async (mongo, pg) => {
      const Proposal = require("../src/models/Proposal");
      const sample = await Proposal.findOne().lean();
      if (!sample) return [{ op: "list", match: true, note: "no proposals" }];
      const publicMongo = await mongo.getPublic(sample._id);
      const publicPg = await pg.getPublic(sample._id);
      return [
        result(
          checkFields(publicMongo, publicPg, ["_id", "propertyTitle"]),
          "getPublic"
        ),
        result(checkFields(publicMongo, await pg.getById(sample._id), ["_id", "propertyTitle"]), "getById"),
      ];
    },
  },
  {
    name: "enquiry",
    mongo: () => require("../src/services/enquiryService.mongo"),
    prisma: () => require("../src/services/enquiryService.prisma"),
    tests: async (mongo, pg) => {
      const listMongo = await mongo.list({ limit: 5 });
      const listPg = await pg.list({ limit: 5 });
      if (listMongo.length === 0) {
        return [{ op: "list", match: true, note: "no enquiries in mongo" }];
      }
      const id = listMongo[0]._id;
      return [
        { op: "list", ...compareResults(listMongo.length, listPg.length) },
        result(
          checkFields(await mongo.getById(id), await pg.getById(id), ["_id", "customerName", "email"]),
          "getById"
        ),
      ];
    },
  },
];

async function main() {
  if (!process.env.MONGODB_URI || !process.env.DATABASE_URL) {
    console.error("[validate-service-modules] MONGODB_URI and DATABASE_URL required");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await prisma.$queryRaw`SELECT 1`;

  const report = { startedAt: new Date().toISOString(), modules: {}, passed: true };

  for (const mod of MODULES) {
    console.log(`[validate-service-modules] ${mod.name}...`);
    const mongo = mod.mongo();
    const pg = mod.prisma();
    const checks = await mod.tests(mongo, pg);
    const failed = checks.filter((c) => c.match === false);
    report.modules[mod.name] = { checks, failed: failed.length };
    if (failed.length) report.passed = false;
    checks.forEach((check) => {
      console.log(`  ${check.op}: ${check.match ? "OK" : "DIFF"}${check.note ? ` (${check.note})` : ""}`);
    });
  }

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n[validate-service-modules] ${report.passed ? "PASSED" : "FAILED"}`);
  console.log(`[validate-service-modules] report: ${REPORT_PATH}`);

  await mongoose.disconnect();
  await prisma.$disconnect();
  process.exit(report.passed ? 0 : 1);
}

main().catch(async (error) => {
  console.error("[validate-service-modules] Fatal:", error);
  await mongoose.disconnect().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
