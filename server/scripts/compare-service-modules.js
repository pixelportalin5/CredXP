#!/usr/bin/env node
/**
 * Compares Mongo vs Prisma service outputs per module and writes a diff report.
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

require("../src/models/User");
require("../src/models/Property");
require("../src/models/Proposal");
require("../src/models/SavedProperty");

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { compareResults } = require("./lib/compareResults");

const REPORT_PATH = path.join(__dirname, "compare-service-modules-report.json");

const MODULE_SPECS = [
  { name: "contactMessage", mongo: "../src/services/contactService.mongo", prisma: "../src/services/contactService.prisma", run: async (m, p) => ({ list: compareResults((await m.list({ limit: 10 })).length, (await p.list({ limit: 10 })).length) }) },
  { name: "savedProperty", mongo: "../src/services/savedPropertyService.mongo", prisma: "../src/services/savedPropertyService.prisma", run: async (m, p) => {
    const sample = await require("../src/models/SavedProperty").findOne().lean();
    if (!sample) return { note: "no data" };
    const userId = String(sample.userId);
    return { list: compareResults((await m.list(userId)).length, (await p.list(userId)).length) };
  }},
  { name: "auditLog", mongo: "../src/services/auditLogService.mongo", prisma: "../src/services/auditLogService.prisma", run: async (m, p) => ({ list: compareResults((await m.list({ limit: 10 })).length, (await p.list({ limit: 10 })).length) }) },
  { name: "user", mongo: "../src/services/authService.mongo", prisma: "../src/services/authService.prisma", run: async (m, p) => ({ list: compareResults((await m.list({ limit: 10 })).length, (await p.list({ limit: 10 })).length) }) },
  { name: "coworkingSpace", mongo: "../src/services/coworkingService.mongo", prisma: "../src/services/coworkingService.prisma", run: async (m, p) => {
    const a = await m.getAll({ page: 1, limit: 10 });
    const b = await p.getAll({ page: 1, limit: 10 });
    return { list: compareResults(a.spaces.length, b.spaces.length), pagination: compareResults(a.pagination.totalItems, b.pagination.totalItems) };
  }},
  { name: "property", mongo: "../src/services/propertyService.mongo", prisma: "../src/services/propertyService.prisma", run: async (m, p) => {
    const a = await m.getAll({ page: 1, limit: 10 });
    const b = await p.getAll({ page: 1, limit: 10 });
    return { list: compareResults(a.properties.length, b.properties.length), pagination: compareResults(a.pagination.totalItems, b.pagination.totalItems) };
  }},
  { name: "proposal", mongo: "../src/services/proposalService.mongo", prisma: "../src/services/proposalService.prisma", run: async (m, p) => {
    const sample = await require("../src/models/Proposal").findOne().lean();
    if (!sample) return { note: "no data" };
    return { getPublic: compareResults(await m.getPublic(sample._id), await p.getPublic(sample._id)) };
  }},
  { name: "enquiry", mongo: "../src/services/enquiryService.mongo", prisma: "../src/services/enquiryService.prisma", run: async (m, p) => ({ list: compareResults((await m.list({ limit: 10 })).length, (await p.list({ limit: 10 })).length) }) },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const report = { startedAt: new Date().toISOString(), modules: {} };

  for (const spec of MODULE_SPECS) {
    const mongo = require(spec.mongo);
    const pg = require(spec.prisma);
    report.modules[spec.name] = await spec.run(mongo, pg);
    console.log(`[compare-service-modules] ${spec.name}`, report.modules[spec.name]);
  }

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`[compare-service-modules] report: ${REPORT_PATH}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
