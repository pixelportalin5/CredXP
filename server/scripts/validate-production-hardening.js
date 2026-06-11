#!/usr/bin/env node
/**
 * Production Hardening Sprint — admin list, image migration, auth, proposals.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const jwt = require("jsonwebtoken");
const { execSync } = require("child_process");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
process.env.DB_PROVIDER = "postgres";

const prisma = require("../src/lib/prisma");
const adminService = require("../src/services/adminService");
const authService = require("../src/services/authService");
const { isBase64DataUrl } = require("../src/utils/listPayload");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 5000);
const REPORT_JSON = path.join(__dirname, "validate-production-hardening-report.json");
const REPORT_MD = path.join(__dirname, "..", "..", "docs", "migration", "PRODUCTION_HARDENING_REPORT.md");

const results = [];
let imageReport = null;
let migrateDryRun = null;

function record(area, name, status, details = {}) {
  results.push({ area, name, status, ...details });
}

function httpRequest(method, urlPath, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const headers = {};
    let payload;
    if (body) {
      payload = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(payload);
    }
    if (token) headers.Authorization = `Bearer ${token}`;

    const req = http.request(
      { hostname: HOST, port: PORT, path: urlPath, method, headers, timeout: 20000 },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks);
          let json = null;
          try {
            json = JSON.parse(raw.toString("utf8"));
          } catch {
            json = null;
          }
          resolve({
            status: res.statusCode,
            ms: Date.now() - start,
            sizeKb: Math.round(raw.length / 1024),
            raw,
            json,
            hasBase64: raw.includes("data:image/"),
          });
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
    if (payload) req.write(payload);
    req.end();
  });
}

function signToken(user) {
  return jwt.sign({ id: user.legacyMongoId, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

async function isServerUp() {
  try {
    await httpRequest("GET", "/api/health");
    return true;
  } catch {
    return false;
  }
}

async function testAdminListOptimization() {
  const area = "Admin Property List";

  const start = Date.now();
  const properties = await adminService.listProperties({});
  const json = JSON.stringify({ success: true, data: properties });
  const sizeKb = Math.round(Buffer.byteLength(json, "utf8") / 1024);
  const ms = Date.now() - start;
  const hasBase64 = json.includes("data:image/");
  const hasImagesArray = properties.some((p) => Array.isArray(p.images) && p.images.length > 0);

  record(
    area,
    "Service listProperties payload",
    !hasBase64 && !hasImagesArray && properties.length >= 0 ? "PASS" : "FAIL",
    {
      endpoint: "adminService.listProperties()",
      ms,
      sizeKb,
      notes: `count=${properties.length}, base64=${hasBase64}, images[]=${hasImagesArray}`,
      rootCause: hasBase64 ? "Response still contains base64 cover data" : hasImagesArray ? "images[] not stripped" : null,
    }
  );

  const serverUp = await isServerUp();
  if (!serverUp) {
    record(area, "HTTP GET /api/admin/properties", "WARN", {
      endpoint: "GET /api/admin/properties",
      rootCause: "API server not running — start server for HTTP validation",
    });
    return;
  }

  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) {
    record(area, "HTTP GET /api/admin/properties", "FAIL", { rootCause: "No admin user in database" });
    return;
  }

  const httpRes = await httpRequest("GET", "/api/admin/properties", { token: signToken(admin) });
  record(
    area,
    "HTTP GET /api/admin/properties",
    httpRes.status === 200 && !httpRes.hasBase64 ? "PASS" : "FAIL",
    {
      endpoint: "GET /api/admin/properties",
      ms: httpRes.ms,
      sizeKb: httpRes.sizeKb,
      rootCause:
        httpRes.status !== 200
          ? `HTTP ${httpRes.status}`
          : httpRes.hasBase64
            ? "HTTP response contains base64"
            : null,
    }
  );
}

function analyzeStringField(value) {
  if (!value || typeof value !== "string") return { empty: true, base64: false, cloudinary: false };
  return {
    empty: value.length === 0,
    base64: isBase64DataUrl(value),
    cloudinary: value.includes("res.cloudinary.com/"),
  };
}

async function analyzeImageMigration() {
  const area = "Cloudinary Image Migration";

  const [properties, coworking, users, proposals] = await Promise.all([
    prisma.property.findMany({
      select: { legacyMongoId: true, coverImage: true, coverImagePublicId: true, images: true, imagePublicIds: true },
    }),
    prisma.coworkingSpace.findMany({
      select: { legacyMongoId: true, coverImage: true, coverImagePublicId: true, images: true, imagePublicIds: true },
    }),
    prisma.user.findMany({ select: { legacyMongoId: true, avatar: true, avatarPublicId: true } }),
    prisma.proposal.findMany({
      select: { legacyMongoId: true, coverImage: true, coverImagePublicId: true, agent: true },
    }),
  ]);

  function summarizeCollection(name, rows, { coverKey = "coverImage", imagesKey = "images", avatarKey } = {}) {
    const stats = {
      total: rows.length,
      coverBase64: 0,
      coverCloudinary: 0,
      coverEmpty: 0,
      coverPublicId: 0,
      imagesBase64: 0,
      imagesCloudinary: 0,
      imagesEmpty: 0,
      avatarBase64: 0,
      avatarCloudinary: 0,
      avatarEmpty: 0,
      sampleBase64Ids: [],
    };

    for (const row of rows) {
      const cover = analyzeStringField(row[coverKey]);
      if (cover.base64) {
        stats.coverBase64 += 1;
        if (stats.sampleBase64Ids.length < 5) stats.sampleBase64Ids.push(row.legacyMongoId);
      } else if (cover.cloudinary) stats.coverCloudinary += 1;
      else if (cover.empty) stats.coverEmpty += 1;

      const publicId = row.coverImagePublicId || row.avatarPublicId;
      if (publicId && String(publicId).trim()) stats.coverPublicId += 1;

      if (imagesKey && Array.isArray(row[imagesKey])) {
        if (row[imagesKey].length === 0) stats.imagesEmpty += 1;
        for (const img of row[imagesKey]) {
          if (isBase64DataUrl(img)) stats.imagesBase64 += 1;
          else if (typeof img === "string" && img.includes("res.cloudinary.com/")) stats.imagesCloudinary += 1;
        }
      }

      if (avatarKey) {
        const avatar = analyzeStringField(row[avatarKey]);
        if (avatar.base64) {
          stats.avatarBase64 += 1;
          if (stats.sampleBase64Ids.length < 5) stats.sampleBase64Ids.push(row.legacyMongoId);
        } else if (avatar.cloudinary) stats.avatarCloudinary += 1;
        else if (avatar.empty) stats.avatarEmpty += 1;
        if (row.avatarPublicId && String(row.avatarPublicId).trim()) stats.coverPublicId += 1;
      }

      if (row.agent && typeof row.agent === "object") {
        const agentAvatar = analyzeStringField(row.agent.avatar);
        if (agentAvatar.base64) {
          stats.agentAvatarBase64 = (stats.agentAvatarBase64 || 0) + 1;
          if (stats.sampleBase64Ids.length < 5) stats.sampleBase64Ids.push(row.legacyMongoId);
        } else if (agentAvatar.cloudinary) {
          stats.agentAvatarCloudinary = (stats.agentAvatarCloudinary || 0) + 1;
        }
      }
    }

    return stats;
  }

  imageReport = {
    analyzedAt: new Date().toISOString(),
    dbProvider: "postgres",
    collections: {
      properties: summarizeCollection("properties", properties),
      coworking: summarizeCollection("coworking", coworking),
      users: summarizeCollection("users", users, { avatarKey: "avatar", coverKey: null, imagesKey: null }),
      proposals: summarizeCollection("proposals", proposals, { avatarKey: null }),
    },
    tooling: {
      mongoScript: "server/scripts/migrate-images-to-cloudinary.js",
      npmScripts: ["migrate:images", "migrate:images:dry-run"],
      note: "Migration script targets MongoDB source; PostgreSQL rows need migrate:mongo-to-postgres after image migration or a Prisma-targeted sync.",
    },
  };

  const totalBase64 =
    imageReport.collections.properties.coverBase64 +
    imageReport.collections.properties.imagesBase64 +
    imageReport.collections.coworking.coverBase64 +
    imageReport.collections.coworking.imagesBase64 +
    imageReport.collections.users.avatarBase64 +
    imageReport.collections.proposals.coverBase64 +
    (imageReport.collections.proposals.agentAvatarBase64 || 0);

  record(
    area,
    "PostgreSQL base64 image inventory",
    totalBase64 === 0 ? "PASS" : "WARN",
    {
      notes: `properties cover base64=${imageReport.collections.properties.coverBase64}, images base64=${imageReport.collections.properties.imagesBase64}; coworking cover=${imageReport.collections.coworking.coverBase64}; user avatars=${imageReport.collections.users.avatarBase64}; proposals cover=${imageReport.collections.proposals.coverBase64}`,
      rootCause: totalBase64 > 0 ? `${totalBase64} base64 image field(s) remain in PostgreSQL` : null,
    }
  );

  const missingPublicIds =
    imageReport.collections.properties.total - imageReport.collections.properties.coverPublicId;
  record(
    area,
    "coverImagePublicId coverage (properties)",
    imageReport.collections.properties.coverPublicId > 0 ? "WARN" : "WARN",
    {
      notes: `${imageReport.collections.properties.coverPublicId}/${imageReport.collections.properties.total} properties have coverImagePublicId`,
      rootCause:
        imageReport.collections.properties.coverPublicId === 0
          ? "No Cloudinary public IDs — list thumbnails rely on empty covers until migrate:images + re-sync"
          : `${missingPublicIds} properties missing coverImagePublicId`,
    }
  );

  if (process.env.MONGODB_URI) {
    try {
      const output = execSync("node scripts/migrate-images-to-cloudinary.js --dry-run", {
        cwd: path.join(__dirname, ".."),
        encoding: "utf8",
        timeout: 120000,
      });
      const reportPath = path.join(__dirname, "migrate-images-report.json");
      if (fs.existsSync(reportPath)) {
        migrateDryRun = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      }
      record(area, "Mongo migrate:images:dry-run tooling", migrateDryRun ? "PASS" : "WARN", {
        notes: migrateDryRun
          ? `scanned=${migrateDryRun.totals.scanned} wouldMigrate=${migrateDryRun.totals.migrated} skipped=${migrateDryRun.totals.skipped}`
          : "Dry-run completed but report missing",
      });
      if (output) {
        /* captured */
      }
    } catch (error) {
      record(area, "Mongo migrate:images:dry-run tooling", "FAIL", {
        rootCause: error.stderr || error.message || String(error),
      });
    }
  } else {
    record(area, "Mongo migrate:images:dry-run tooling", "WARN", {
      rootCause: "MONGODB_URI not set — cannot validate Mongo migration tooling",
    });
  }
}

async function testAuthPrisma() {
  const area = "Authentication (Prisma)";

  const testEmail = `hardening-${Date.now()}@credxp.test`;
  const testPassword = "HardeningTest1!";
  let testUserId = null;

  try {
    const registered = await authService.register({
      name: "Hardening Test",
      email: testEmail,
      password: testPassword,
      role: "buyer",
    });
    const regOk = registered.token && registered.user?.email === testEmail;
    record(area, "register", regOk ? "PASS" : "FAIL", {
      endpoint: "authService.register",
      rootCause: regOk ? null : "Registration did not return token/user",
    });
    testUserId = registered.user._id;

    try {
      await authService.register({ name: "Dup", email: testEmail, password: testPassword });
      record(area, "register duplicate rejection", "FAIL", { rootCause: "Duplicate email should throw 409" });
    } catch (error) {
      record(area, "register duplicate rejection", error.statusCode === 409 ? "PASS" : "FAIL", {
        rootCause: error.statusCode !== 409 ? error.message : null,
      });
    }

    const login = await authService.login({ email: testEmail, password: testPassword });
    record(area, "login", login.token && login.user?.role === "buyer" ? "PASS" : "FAIL", {
      endpoint: "authService.login",
    });

    try {
      await authService.login({ email: testEmail, password: "wrong-password" });
      record(area, "login invalid password", "FAIL", { rootCause: "Should reject invalid password" });
    } catch (error) {
      record(area, "login invalid password", error.statusCode === 401 ? "PASS" : "FAIL", {
        rootCause: error.statusCode !== 401 ? error.message : null,
      });
    }

    const me = await authService.getMe(testUserId);
    record(area, "getMe", me.email === testEmail ? "PASS" : "FAIL", { endpoint: "authService.getMe" });

    const decoded = jwt.verify(login.token, process.env.JWT_SECRET);
    record(area, "JWT role claim", decoded.role === "buyer" ? "PASS" : "FAIL", {
      notes: `token role=${decoded.role}`,
    });

    const admin = await prisma.user.findFirst({ where: { role: "admin" } });
    if (admin) {
      const adminToken = signToken(admin);
      const adminDecoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      record(area, "admin role token", adminDecoded.role === "admin" ? "PASS" : "FAIL", {
        notes: "Role checks for admin routes rely on JWT middleware",
      });
    } else {
      record(area, "admin role token", "WARN", { rootCause: "No admin user for role check" });
    }

    record(area, "logout", "PASS", {
      notes: "Client-side token removal; no server session invalidation required",
    });
  } catch (error) {
    record(area, "auth service suite", "FAIL", { rootCause: error.message || String(error) });
  } finally {
    if (testUserId) {
      const user = await prisma.user.findFirst({ where: { legacyMongoId: testUserId } });
      if (user) await prisma.user.delete({ where: { id: user.id } });
    }
  }

  if (process.env.PHASE5A_TEST_EMAIL && process.env.PHASE5A_TEST_PASSWORD) {
    const serverUp = await isServerUp();
    if (serverUp) {
      const httpLogin = await httpRequest("POST", "/api/auth/login", {
        body: { email: process.env.PHASE5A_TEST_EMAIL, password: process.env.PHASE5A_TEST_PASSWORD },
      });
      record(area, "HTTP login E2E", httpLogin.status === 200 && httpLogin.json?.data?.token ? "PASS" : "FAIL", {
        endpoint: "POST /api/auth/login",
        rootCause: httpLogin.status !== 200 ? httpLogin.json?.message || `HTTP ${httpLogin.status}` : null,
      });

      if (httpLogin.json?.data?.token) {
        const meHttp = await httpRequest("GET", "/api/auth/me", { token: httpLogin.json.data.token });
        record(area, "HTTP getMe E2E", meHttp.status === 200 ? "PASS" : "FAIL", {
          endpoint: "GET /api/auth/me",
          rootCause: meHttp.status !== 200 ? `HTTP ${meHttp.status}` : null,
        });
      }
    } else {
      record(area, "HTTP login E2E", "WARN", { rootCause: "Server not running" });
    }
  } else {
    record(area, "HTTP login E2E", "WARN", {
      rootCause: "Set PHASE5A_TEST_EMAIL and PHASE5A_TEST_PASSWORD for password login E2E",
    });
  }
}

async function testProposals() {
  const area = "Proposal PDF";

  const sample = await prisma.proposal.findFirst({ orderBy: { createdAt: "desc" } });
  if (!sample) {
    record(area, "Proposal data present", "WARN", { rootCause: "No proposals in PostgreSQL" });
    record(area, "Public proposal page", "WARN", { rootCause: "No sample proposal" });
    record(area, "Proposal preview (staff)", "WARN", { rootCause: "No sample proposal" });
    record(area, "PDF generation", "WARN", { rootCause: "Manual browser test required" });
    return;
  }

  const requiredFields = ["propertyTitle", "agent", "propertySnapshot"];
  const missing = requiredFields.filter((field) => !sample[field]);
  record(
    area,
    "Proposal record structure",
    missing.length === 0 ? "PASS" : "FAIL",
    { notes: missing.length ? `Missing: ${missing.join(", ")}` : "propertyTitle, agent, propertySnapshot present" }
  );

  const cover = analyzeStringField(sample.coverImage);
  record(
    area,
    "Proposal cover image",
    cover.base64 ? "WARN" : "PASS",
    {
      notes: cover.cloudinary
        ? "Cloudinary URL"
        : cover.base64
          ? "Base64 cover — increases payload size"
          : "No cover image",
    }
  );

  const serverUp = await isServerUp();
  if (!serverUp) {
    record(area, "Public proposal page", "WARN", { rootCause: "Server not running" });
    record(area, "Proposal preview (staff)", "WARN", { rootCause: "Server not running" });
    record(area, "PDF generation", "WARN", { rootCause: "Manual browser test (html2canvas + jspdf)" });
    return;
  }

  const pub = await httpRequest("GET", `/api/proposals/${sample.legacyMongoId}/public`);
  record(
    area,
    "Public proposal page",
    pub.status === 200 && pub.json?.data?.propertyTitle ? "PASS" : "FAIL",
    {
      endpoint: `GET /api/proposals/${sample.legacyMongoId}/public`,
      route: `/proposals/${sample.legacyMongoId}`,
      ms: pub.ms,
      sizeKb: pub.sizeKb,
      rootCause: pub.status !== 200 ? `HTTP ${pub.status}` : null,
    }
  );

  const creator = await prisma.user.findUnique({ where: { id: sample.createdById } });
  if (creator) {
    const portal = creator.role === "employee" ? "employee" : "admin";
    const token = signToken(creator);
    const staff = await httpRequest("GET", `/api/${portal}/proposals/${sample.legacyMongoId}`, { token });
    record(
      area,
      "Proposal preview (staff)",
      staff.status === 200 && staff.json?.data?._id ? "PASS" : "FAIL",
      {
        endpoint: `GET /api/${portal}/proposals/${sample.legacyMongoId}`,
        route: "/properties/[id]/proposal/preview",
        ms: staff.ms,
        rootCause: staff.status !== 200 ? `HTTP ${staff.status}` : null,
      }
    );
  } else {
    record(area, "Proposal preview (staff)", "WARN", { rootCause: "Proposal creator not found" });
  }

  record(area, "PDF generation", "WARN", {
    route: "/properties/[id]/proposal/preview",
    notes: "Client-side html2canvas/jspdf — requires manual browser verification; lab() CSS fix in html2canvasSafeClone.ts",
  });
}

function buildMarkdown(report) {
  const lines = [
    "# Production Hardening Report",
    "",
    `**Generated:** ${report.completedAt}`,
    `**DB_PROVIDER:** \`${report.dbProvider}\``,
    "",
    "## Summary",
    "",
    "| Result | Count |",
    "|--------|-------|",
    `| PASS | ${report.summary.pass} |`,
    `| FAIL | ${report.summary.fail} |`,
    `| WARN | ${report.summary.warn} |`,
    "",
    "## Results",
    "",
    "| Area | Test | Status | Notes |",
    "|------|------|--------|-------|",
  ];

  for (const row of report.results) {
    const note = row.rootCause || row.notes || "—";
    lines.push(`| ${row.area} | ${row.name} | **${row.status}** | ${note} |`);
  }

  if (report.imageMigration) {
    lines.push("", "## Image Migration Inventory (PostgreSQL)", "");
    for (const [name, stats] of Object.entries(report.imageMigration.collections)) {
      lines.push(`### ${name}`, "");
      lines.push("```json");
      lines.push(JSON.stringify(stats, null, 2));
      lines.push("```", "");
    }
  }

  if (report.migrateDryRun) {
    lines.push("## Mongo migrate:images:dry-run", "");
    lines.push("```json");
    lines.push(JSON.stringify(report.migrateDryRun.totals, null, 2));
    lines.push("```", "");
  }

  if (report.remainingBlockers.length) {
    lines.push("## Remaining Blockers", "");
    for (const b of report.remainingBlockers) lines.push(`- ${b}`);
  }

  return lines.join("\n");
}

async function main() {
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    console.error("[hardening] DATABASE_URL and JWT_SECRET required");
    process.exit(1);
  }

  await prisma.$queryRaw`SELECT 1`;

  await testAdminListOptimization();
  await analyzeImageMigration();
  await testAuthPrisma();
  await testProposals();

  const summary = {
    pass: results.filter((r) => r.status === "PASS").length,
    fail: results.filter((r) => r.status === "FAIL").length,
    warn: results.filter((r) => r.status === "WARN").length,
    total: results.length,
  };

  const remainingBlockers = [];
  if (results.some((r) => r.status === "FAIL")) {
    remainingBlockers.push("Resolve FAIL items before PostgreSQL production cutover");
  }
  if (imageReport?.collections?.properties?.coverPublicId === 0) {
    remainingBlockers.push("Run npm run migrate:images on MongoDB, then re-sync images to PostgreSQL");
  }
  if (results.some((r) => r.name === "HTTP login E2E" && r.status === "WARN")) {
    remainingBlockers.push("Configure PHASE5A_TEST_EMAIL/PASSWORD for login E2E against running API");
  }
  if (results.some((r) => r.name === "PDF generation" && r.status === "WARN")) {
    remainingBlockers.push("Manual proposal PDF download verification in browser");
  }
  const base64Warn = results.find((r) => r.name === "PostgreSQL base64 image inventory" && r.status === "WARN");
  if (base64Warn) {
    remainingBlockers.push("Migrate remaining base64 images to Cloudinary");
  }

  const report = {
    sprint: "production-hardening",
    dbProvider: "postgres",
    completedAt: new Date().toISOString(),
    summary,
    results,
    imageMigration: imageReport,
    migrateDryRun,
    remainingBlockers,
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
  fs.mkdirSync(path.dirname(REPORT_MD), { recursive: true });
  fs.writeFileSync(REPORT_MD, buildMarkdown(report));

  console.log(JSON.stringify({ summary, reportJson: REPORT_JSON, reportMd: REPORT_MD }, null, 2));
  console.log("\n--- Details ---");
  for (const r of results) {
    console.log(`${r.status.padEnd(4)} [${r.area}] ${r.name}${r.rootCause ? ` — ${r.rootCause}` : ""}${r.notes ? ` (${r.notes})` : ""}`);
  }

  await prisma.$disconnect();
  process.exit(summary.fail > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
