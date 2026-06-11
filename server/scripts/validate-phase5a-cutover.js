#!/usr/bin/env node
/**
 * Phase 5A — Staged PostgreSQL cutover validation (local/staging only).
 * Forces DB_PROVIDER=postgres for runtime service resolution.
 */

const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
process.env.DB_PROVIDER = "postgres";

require("../src/models/User");
require("../src/models/Property");
require("../src/models/CoworkingSpace");
require("../src/models/Enquiry");
require("../src/models/Proposal");
require("../src/models/SavedProperty");
require("../src/models/ContactMessage");
require("../src/models/AuditLog");

const mongoose = require("mongoose");
const prisma = require("../src/lib/prisma");
const { getDbProvider } = require("../src/lib/dbProvider");
const { resolveAuthUser } = require("../src/lib/resolveAuthUser");

const authService = require("../src/services/authService");
const propertyService = require("../src/services/propertyService");
const coworkingService = require("../src/services/coworkingService");
const savedPropertyService = require("../src/services/savedPropertyService");
const contactService = require("../src/services/contactService");
const proposalService = require("../src/services/proposalService");
const auditLogService = require("../src/services/auditLogService");
const enquiryService = require("../src/services/enquiryService");
const adminService = require("../src/services/adminService");

const REPORT_PATH = path.join(__dirname, "validate-phase5a-report.json");
const MARKDOWN_PATH = path.join(__dirname, "..", "..", "docs", "migration", "PHASE5A_VALIDATION_REPORT.md");

const MODULES = [
  "Authentication",
  "Users",
  "Properties",
  "Coworking",
  "Saved Properties",
  "Contact Messages",
  "Proposals",
  "Audit Logs",
  "Admin Dashboard",
  "Seller Dashboard",
  "Employee Dashboard",
];

function moduleResult(status, details = {}) {
  return { status, ...details };
}

function scoreFromModules(modules) {
  const weights = { PASS: 1, WARN: 0.5, FAIL: 0 };
  let total = 0;
  let earned = 0;
  for (const name of MODULES) {
    const row = modules[name];
    if (!row) continue;
    total += 1;
    earned += weights[row.status] ?? 0;
  }
  return total ? Math.round((earned / total) * 100) : 0;
}

function readinessLabel(score) {
  if (score >= 90) return "READY — staging cutover approved; production switch pending sign-off";
  if (score >= 75) return "NEAR READY — resolve WARN/FAIL items before production";
  if (score >= 50) return "PARTIAL — significant gaps remain";
  return "NOT READY — block production cutover";
}

async function runModule(name, fn) {
  try {
    const outcome = await fn();
    const status = outcome.status || "PASS";
    return moduleResult(status, {
      checks: outcome.checks || [],
      warnings: outcome.warnings || [],
      rootCause: outcome.rootCause || null,
      notes: outcome.notes || null,
    });
  } catch (error) {
    return moduleResult("FAIL", {
      rootCause: error.message,
      stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      checks: [],
    });
  }
}

async function findSampleUsers() {
  const [admin, seller, employee, buyer] = await Promise.all([
    prisma.user.findFirst({ where: { role: "admin" } }),
    prisma.user.findFirst({ where: { role: "seller" } }),
    prisma.user.findFirst({ where: { role: "employee" } }),
    prisma.user.findFirst({ where: { role: "buyer" } }),
  ]);
  return { admin, seller, employee, buyer };
}

async function main() {
  if (!process.env.MONGODB_URI || !process.env.DATABASE_URL) {
    console.error("[phase5a] MONGODB_URI and DATABASE_URL required");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("[phase5a] JWT_SECRET required");
    process.exit(1);
  }

  console.log(`[phase5a] DB_PROVIDER=${getDbProvider()} (forced for validation)`);
  await mongoose.connect(process.env.MONGODB_URI);
  await prisma.$queryRaw`SELECT 1`;

  const samples = await findSampleUsers();
  const actor = (user) =>
    user
      ? { _id: user.legacyMongoId, role: user.role, accountStatus: user.accountStatus || "active" }
      : null;

  const report = {
    phase: "5A",
    title: "Staged PostgreSQL Cutover Validation",
    dbProvider: getDbProvider(),
    productionCutover: false,
    startedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    modules: {},
    issuesFixed: [
      "authMiddleware: resolveAuthUser() reads PostgreSQL users when DB_PROVIDER=postgres",
      "adminService: Prisma twin (adminService.prisma.js) + factory; Mongo implementation preserved",
    ],
    remainingIssues: [],
  };

  report.modules.Authentication = await runModule("Authentication", async () => {
    const checks = [];
    const warnings = [];

    if (!samples.admin) {
      return { status: "WARN", warnings: ["No admin user in PostgreSQL — login/JWT checks skipped"], checks };
    }

    const resolved = await resolveAuthUser(samples.admin.legacyMongoId);
    checks.push({ op: "resolveAuthUser(admin)", ok: Boolean(resolved && resolved.role === "admin") });

    const token = jwt.sign(
      { id: samples.admin.legacyMongoId, role: samples.admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const fromToken = await resolveAuthUser(decoded.id);
    checks.push({ op: "jwt+resolveAuthUser", ok: Boolean(fromToken && fromToken._id === samples.admin.legacyMongoId) });

    const me = await authService.getMe(samples.admin.legacyMongoId);
    checks.push({ op: "authService.getMe", ok: me?.email === samples.admin.email });

    const testEmail = process.env.PHASE5A_TEST_EMAIL;
    const testPassword = process.env.PHASE5A_TEST_PASSWORD;
    if (testEmail && testPassword) {
      try {
        const login = await authService.login({ email: testEmail, password: testPassword });
        checks.push({ op: "authService.login", ok: Boolean(login.token && login.user?.email) });
      } catch (loginError) {
        warnings.push(`Login with PHASE5A_TEST_EMAIL failed: ${loginError.message}`);
      }
    } else {
      warnings.push("Set PHASE5A_TEST_EMAIL + PHASE5A_TEST_PASSWORD to validate login flow");
    }

    const failed = checks.filter((c) => !c.ok);
    if (failed.length) {
      return {
        status: "FAIL",
        checks,
        warnings,
        rootCause: failed.map((f) => f.op).join(", "),
      };
    }
    return { status: warnings.length ? "WARN" : "PASS", checks, warnings };
  });

  report.modules.Users = await runModule("Users", async () => {
    const list = await authService.list({ limit: 10 });
    const checks = [{ op: "authService.list", ok: Array.isArray(list) && list.length > 0 }];
    if (samples.buyer) {
      const byId = await authService.getById(samples.buyer.legacyMongoId);
      checks.push({ op: "authService.getById", ok: byId?._id === samples.buyer.legacyMongoId });
    }
    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "User list or getById failed against PostgreSQL" }
      : { status: "PASS", checks };
  });

  report.modules.Properties = await runModule("Properties", async () => {
    const list = await propertyService.getAll({ page: 1, limit: 5 });
    const checks = [
      { op: "getAll", ok: Array.isArray(list.properties) },
      { op: "pagination", ok: typeof list.pagination?.totalItems === "number" },
    ];
    const id = list.properties[0]?._id;
    if (id) {
      const item = await propertyService.getById(id);
      checks.push({ op: "getById", ok: item?._id === id });
      const search = await propertyService.search({ q: item.title?.slice(0, 8) || "", page: 1, limit: 5 });
      checks.push({ op: "search", ok: Array.isArray(search.properties) });
    }
    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "Property read paths failed on PostgreSQL" }
      : { status: "PASS", checks };
  });

  report.modules.Coworking = await runModule("Coworking", async () => {
    const list = await coworkingService.getAll({ page: 1, limit: 5 });
    const checks = [{ op: "getAll", ok: Array.isArray(list.spaces) }];
    const id = list.spaces[0]?._id;
    if (id) {
      const item = await coworkingService.getById(id);
      checks.push({ op: "getById", ok: item?._id === id });
    }
    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "Coworking read paths failed on PostgreSQL" }
      : { status: "PASS", checks };
  });

  report.modules["Saved Properties"] = await runModule("Saved Properties", async () => {
    const sample = await prisma.savedProperty.findFirst({ include: { user: true } });
    if (!sample) {
      return { status: "WARN", warnings: ["No saved properties in PostgreSQL"], checks: [] };
    }
    const list = await savedPropertyService.list(sample.user.legacyMongoId);
    const checks = [{ op: "list", ok: Array.isArray(list) }];
    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "Saved property list failed" }
      : { status: "PASS", checks };
  });

  report.modules["Contact Messages"] = await runModule("Contact Messages", async () => {
    const list = await contactService.list({ limit: 10 });
    const checks = [{ op: "list", ok: Array.isArray(list) }];
    if (list[0]) {
      const item = await contactService.getById(list[0]._id);
      checks.push({ op: "getById", ok: item?._id === list[0]._id });
    }
    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "Contact message reads failed" }
      : { status: list.length === 0 ? "WARN" : "PASS", checks, warnings: list.length === 0 ? ["No contact messages"] : [] };
  });

  report.modules.Proposals = await runModule("Proposals", async () => {
    const sample = await prisma.proposal.findFirst();
    if (!sample) {
      return { status: "WARN", warnings: ["No proposals in PostgreSQL"], checks: [] };
    }
    const checks = [];
    const pub = await proposalService.getPublic(sample.legacyMongoId);
    checks.push({ op: "getPublic", ok: pub?._id === sample.legacyMongoId });
    const creator = await prisma.user.findUnique({ where: { id: sample.createdById } });
    if (creator) {
      const owned = await proposalService.getByIdForUser(creator.legacyMongoId, sample.legacyMongoId);
      checks.push({ op: "getByIdForUser", ok: owned?._id === sample.legacyMongoId });
      const userList = await proposalService.listByUser(creator.legacyMongoId);
      checks.push({ op: "listByUser", ok: Array.isArray(userList) && userList.length > 0 });
    }
    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "Proposal read paths failed" }
      : { status: "PASS", checks };
  });

  report.modules["Audit Logs"] = await runModule("Audit Logs", async () => {
    const list = await auditLogService.list({ limit: 10 });
    const checks = [{ op: "list", ok: Array.isArray(list) }];
    if (list[0]) {
      const item = await auditLogService.getById(list[0]._id);
      checks.push({ op: "getById", ok: item?._id === list[0]._id });
    }
    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "Audit log reads failed" }
      : { status: list.length === 0 ? "WARN" : "PASS", checks };
  });

  report.modules["Admin Dashboard"] = await runModule("Admin Dashboard", async () => {
    if (!samples.admin) {
      return { status: "FAIL", rootCause: "No admin user in PostgreSQL" };
    }
    const adminActor = actor(samples.admin);
    const checks = [];
    const summary = await adminService.summary();
    checks.push({ op: "summary", ok: typeof summary.metrics?.totalUsers === "number" });
    checks.push({ op: "summary.dataQuality", ok: typeof summary.dataQuality?.missingImages === "number" });

    const users = await adminService.listUsers({});
    checks.push({ op: "listUsers", ok: Array.isArray(users) && users.length > 0 });

    const properties = await adminService.listProperties({});
    checks.push({ op: "listProperties", ok: Array.isArray(properties) });

    const enquiries = await adminService.listEnquiries({});
    checks.push({ op: "listEnquiries", ok: Array.isArray(enquiries) });

    const logs = await adminService.listLogs();
    checks.push({ op: "listLogs", ok: Array.isArray(logs) });

    const coworking = await adminService.listCoworkingSpaces({});
    checks.push({ op: "listCoworkingSpaces", ok: Array.isArray(coworking) });

    if (enquiries[0]) {
      const prev = enquiries[0].status;
      const toggled = prev === "closed" ? "open" : "closed";
      await adminService.updateEnquiryStatus(adminActor, enquiries[0]._id, toggled);
      await adminService.updateEnquiryStatus(adminActor, enquiries[0]._id, prev);
      checks.push({ op: "updateEnquiryStatus (round-trip)", ok: true });
    }

    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "Admin dashboard operations failed on PostgreSQL" }
      : { status: "PASS", checks };
  });

  report.modules["Seller Dashboard"] = await runModule("Seller Dashboard", async () => {
    if (!samples.seller) {
      return { status: "WARN", warnings: ["No seller user in PostgreSQL"], checks: [] };
    }
    const sellerId = samples.seller.legacyMongoId;
    const checks = [];
    const properties = await propertyService.getSellerProperties(sellerId);
    checks.push({ op: "getSellerProperties", ok: Array.isArray(properties) });
    const spaces = await coworkingService.getSellerSpaces(sellerId);
    checks.push({ op: "getSellerSpaces", ok: Array.isArray(spaces) });
    const enquiries = await enquiryService.getForSeller(sellerId);
    checks.push({ op: "getForSeller", ok: Array.isArray(enquiries) });
    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "Seller dashboard reads failed" }
      : { status: "PASS", checks };
  });

  report.modules["Employee Dashboard"] = await runModule("Employee Dashboard", async () => {
    const staff = samples.employee || samples.admin;
    if (!staff) {
      return { status: "FAIL", rootCause: "No employee or admin user for staff dashboard checks" };
    }
    const staffActor = actor(staff);
    const checks = [];
    const summary = await adminService.summary();
    checks.push({ op: "summary", ok: typeof summary.metrics?.totalUsers === "number" });
    const properties = await adminService.listProperties({});
    checks.push({ op: "listProperties", ok: Array.isArray(properties) });
    const enquiries = await adminService.listEnquiries({});
    checks.push({ op: "listEnquiries", ok: Array.isArray(enquiries) });
    const logs = await adminService.listLogs();
    checks.push({ op: "listLogs", ok: Array.isArray(logs) });
    const coworking = await adminService.listCoworkingSpaces({});
    checks.push({ op: "listCoworkingSpaces", ok: Array.isArray(coworking) });

    if (properties[0]) {
      const title = properties[0].title;
      await adminService.updateProperty(staffActor, properties[0]._id, { title });
      checks.push({ op: "updateProperty", ok: true });
    }

    const failed = checks.filter((c) => !c.ok);
    return failed.length
      ? { status: "FAIL", checks, rootCause: "Employee dashboard operations failed" }
      : { status: "PASS", checks };
  });

  report.cutoverReadinessScore = scoreFromModules(report.modules);
  report.readinessAssessment = readinessLabel(report.cutoverReadinessScore);
  report.finishedAt = new Date().toISOString();

  const counts = { PASS: 0, WARN: 0, FAIL: 0 };
  for (const name of MODULES) {
    const s = report.modules[name]?.status;
    if (s) counts[s] = (counts[s] || 0) + 1;
    if (s === "FAIL") {
      report.remainingIssues.push({
        module: name,
        rootCause: report.modules[name].rootCause,
      });
    }
    if (s === "WARN") {
      report.remainingIssues.push({
        module: name,
        severity: "WARN",
        notes: report.modules[name].warnings || report.modules[name].notes,
      });
    }
  }

  report.summary = counts;
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  const md = buildMarkdownReport(report);
  fs.mkdirSync(path.dirname(MARKDOWN_PATH), { recursive: true });
  fs.writeFileSync(MARKDOWN_PATH, md);

  console.log("\n[phase5a] Validation complete");
  console.log(`[phase5a] Score: ${report.cutoverReadinessScore}/100 — ${report.readinessAssessment}`);
  console.log(`[phase5a] PASS=${counts.PASS} WARN=${counts.WARN} FAIL=${counts.FAIL}`);
  console.log(`[phase5a] JSON: ${REPORT_PATH}`);
  console.log(`[phase5a] Markdown: ${MARKDOWN_PATH}`);

  await mongoose.disconnect();
  await prisma.$disconnect();
  process.exit(counts.FAIL > 0 ? 1 : 0);
}

function buildMarkdownReport(report) {
  const lines = [
    "# Phase 5A — PostgreSQL Cutover Validation Report",
    "",
    `**Generated:** ${report.finishedAt}`,
    `**DB_PROVIDER:** \`${report.dbProvider}\``,
    `**Production cutover:** No (validation only)`,
    "",
    `## Cutover Readiness Score: **${report.cutoverReadinessScore}/100**`,
    "",
    report.readinessAssessment,
    "",
    "## Module Results",
    "",
    "| Module | Status | Root cause / notes |",
    "|--------|--------|-------------------|",
  ];

  for (const name of MODULES) {
    const row = report.modules[name] || { status: "—" };
    const note =
      row.rootCause ||
      (row.warnings && row.warnings.length ? row.warnings.join("; ") : row.notes || "—");
    lines.push(`| ${name} | **${row.status}** | ${String(note).replace(/\|/g, "/")} |`);
  }

  lines.push("", "## Issues Fixed (this phase)", "");
  if (report.issuesFixed.length === 0) {
    lines.push("- See commit / implementation notes in PHASE5A_README.md");
  } else {
    report.issuesFixed.forEach((item) => lines.push(`- ${item}`));
  }

  lines.push("", "## Remaining Issues", "");
  if (report.remainingIssues.length === 0) {
    lines.push("- None blocking staging cutover");
  } else {
    report.remainingIssues.forEach((item) => {
      lines.push(`- **${item.module}** (${item.severity || "FAIL"}): ${item.rootCause || JSON.stringify(item.notes)}`);
    });
  }

  lines.push("", "## Production Readiness Assessment", "");
  lines.push(
    report.cutoverReadinessScore >= 90
      ? "Staging validation succeeded. MongoDB remains production default (`DB_PROVIDER=mongo`). Schedule production cutover only after operational sign-off and backup plan."
      : report.cutoverReadinessScore >= 75
        ? "Core paths work on PostgreSQL but warnings remain. Do not switch production until WARN items are addressed or accepted."
        : "Do not cut over production. Resolve FAIL modules and re-run `npm run validate:phase5a`."
  );

  return lines.join("\n");
}

main().catch(async (error) => {
  console.error("[phase5a] Fatal:", error);
  await mongoose.disconnect().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
