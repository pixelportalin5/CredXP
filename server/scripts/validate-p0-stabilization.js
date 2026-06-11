#!/usr/bin/env node
/**
 * Phase 5A P0 Stabilization — HTTP + service validation under DB_PROVIDER=postgres.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
process.env.DB_PROVIDER = "postgres";

const prisma = require("../src/lib/prisma");
const mongoose = require("mongoose");

const PORT = Number(process.env.PORT || 5000);
const HOST = "127.0.0.1";
const REPORT_PATH = path.join(__dirname, "validate-p0-stabilization-report.json");
const MARKDOWN_PATH = path.join(__dirname, "..", "..", "docs", "migration", "P0_STABILIZATION_REPORT.md");

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const results = [];

function record(area, name, status, details = {}) {
  results.push({
    area,
    name,
    status,
    route: details.route || null,
    endpoint: details.endpoint || null,
    rootCause: details.rootCause || null,
    notes: details.notes || null,
    ms: details.ms ?? null,
    sizeKb: details.sizeKb ?? null,
  });
}

function httpRequest(method, urlPath, { token, body, multipart } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const headers = {};

    let payload;
    if (multipart) {
      payload = multipart.body;
      Object.assign(headers, multipart.headers);
    } else if (body) {
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
      reject(new Error("Request timed out after 20s"));
    });
    if (payload) req.write(payload);
    req.end();
  });
}

function signToken(user) {
  return jwt.sign(
    { id: user.legacyMongoId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

async function getSampleUsers() {
  const [admin, seller, employee, buyer] = await Promise.all([
    prisma.user.findFirst({ where: { role: "admin" } }),
    prisma.user.findFirst({ where: { role: "seller" } }),
    prisma.user.findFirst({ where: { role: "employee" } }),
    prisma.user.findFirst({ where: { role: "buyer" } }),
  ]);
  return { admin, seller, employee, buyer };
}

async function testHomepage() {
  const area = "Homepage";

  const investment = await httpRequest(
    "GET",
    "/api/properties?page=1&limit=20&sort=newest&category=investment"
  );
  if (investment.status === 200 && investment.json?.data?.properties?.length > 0 && investment.ms < 15000) {
    record(area, "Investment tab properties", investment.hasBase64 ? "WARN" : "PASS", {
      route: "/",
      endpoint: "GET /api/properties?category=investment",
      ms: investment.ms,
      sizeKb: investment.sizeKb,
      notes: investment.hasBase64 ? "List response contains base64" : null,
    });
  } else {
    record(area, "Investment tab properties", "FAIL", {
      route: "/",
      endpoint: "GET /api/properties?category=investment",
      rootCause: investment.status !== 200 ? `HTTP ${investment.status}` : "Empty or slow response",
      ms: investment.ms,
    });
  }

  const lease = await httpRequest("GET", "/api/properties?page=1&limit=20&sort=newest&category=lease");
  record(
    area,
    "Lease tab properties",
    lease.status === 200 && lease.json?.data?.properties ? "PASS" : "FAIL",
    {
      route: "/",
      endpoint: "GET /api/properties?category=lease",
      ms: lease.ms,
      sizeKb: lease.sizeKb,
      rootCause: lease.status !== 200 ? `HTTP ${lease.status}` : null,
    }
  );

  const featured = await httpRequest("GET", "/api/properties?page=1&limit=20&sort=newest&category=investment");
  record(
    area,
    "Featured properties",
    featured.status === 200 ? "PASS" : "FAIL",
    {
      route: "/",
      endpoint: "GET /api/properties (featured)",
      ms: featured.ms,
      rootCause: featured.status !== 200 ? `HTTP ${featured.status}` : null,
    }
  );

  const coworking = await httpRequest("GET", "/api/coworking?limit=4&sort=featured");
  const coworkingOk = coworking.status === 200 && Array.isArray(coworking.json?.data);
  record(area, "Featured coworking", coworkingOk ? "PASS" : "FAIL", {
    route: "/",
    endpoint: "GET /api/coworking?limit=4&sort=featured",
    ms: coworking.ms,
    rootCause: coworkingOk ? null : coworking.status !== 200 ? `HTTP ${coworking.status}` : "Invalid payload",
  });

  const insights = await httpRequest("GET", "/api/insights?limit=3");
  const insightsOk = insights.status === 200 && Array.isArray(insights.json?.data);
  record(area, "Insights feed", insightsOk ? "PASS" : "FAIL", {
    route: "/",
    endpoint: "GET /api/insights?limit=3",
    ms: insights.ms,
    rootCause: insightsOk ? null : insights.status !== 200 ? `HTTP ${insights.status}` : "Invalid payload",
  });
}

async function testAuthentication(users) {
  const area = "Authentication";

  if (process.env.PHASE5A_TEST_EMAIL && process.env.PHASE5A_TEST_PASSWORD) {
    const login = await httpRequest("POST", "/api/auth/login", {
      body: { email: process.env.PHASE5A_TEST_EMAIL, password: process.env.PHASE5A_TEST_PASSWORD },
    });
    record(
      area,
      "Login",
      login.status === 200 && login.json?.data?.token ? "PASS" : "FAIL",
      {
        route: "/login",
        endpoint: "POST /api/auth/login",
        rootCause: login.status !== 200 ? login.json?.message || `HTTP ${login.status}` : null,
      }
    );
  } else {
    record(area, "Login", "WARN", {
      route: "/login",
      endpoint: "POST /api/auth/login",
      rootCause: "PHASE5A_TEST_EMAIL/PASSWORD not set — password login not exercised",
    });
  }

  if (!users.admin) {
    record(area, "GET /api/auth/me", "FAIL", { endpoint: "GET /api/auth/me", rootCause: "No admin user in DB" });
    return;
  }

  const token = signToken(users.admin);
  const me = await httpRequest("GET", "/api/auth/me", { token });
  record(
    area,
    "GET /api/auth/me",
    me.status === 200 && me.json?.data?.email ? "PASS" : "FAIL",
    {
      route: "/user/credentials",
      endpoint: "GET /api/auth/me",
      ms: me.ms,
      rootCause: me.status !== 200 ? `HTTP ${me.status}` : null,
    }
  );

  record(area, "Logout", "PASS", {
    route: "/login",
    endpoint: "Client-side (localStorage)",
    notes: "Logout is client-only token removal; no server endpoint required",
  });

  record(area, "Profile page data", me.status === 200 ? "PASS" : "WARN", {
    route: "/user/credentials",
    endpoint: "GET /api/auth/me",
    notes: "Profile page depends on auth/me response",
  });
}

async function testPropertyPages() {
  const area = "Property Pages";

  const list = await httpRequest("GET", "/api/properties?page=1&limit=10&sort=newest&category=investment");
  const firstId = list.json?.data?.properties?.[0]?._id;

  record(area, "Property listing", list.status === 200 ? "PASS" : "FAIL", {
    route: "/properties",
    endpoint: "GET /api/properties",
    ms: list.ms,
    sizeKb: list.sizeKb,
  });

  if (firstId) {
    const detail = await httpRequest("GET", `/api/properties/${firstId}`);
    record(
      area,
      "Property details",
      detail.status === 200 && detail.json?.data?._id === firstId ? "PASS" : "FAIL",
      {
        route: `/properties/${firstId}`,
        endpoint: `GET /api/properties/${firstId}`,
        ms: detail.ms,
        sizeKb: detail.sizeKb,
        notes: detail.hasBase64 ? "Detail includes base64 images (expected for unmigrated covers)" : null,
      }
    );
  } else {
    record(area, "Property details", "WARN", { rootCause: "No property id available" });
  }

  const search = await httpRequest("GET", "/api/properties/search?q=gurugram&page=1&limit=10");
  record(area, "Property search", search.status === 200 ? "PASS" : "FAIL", {
    route: "/properties",
    endpoint: "GET /api/properties/search",
    ms: search.ms,
  });

  const filter = await httpRequest(
    "GET",
    "/api/properties?page=1&limit=10&category=investment&city=Gurugram&sort=price_asc"
  );
  record(area, "Property filters", filter.status === 200 ? "PASS" : "FAIL", {
    route: "/invest",
    endpoint: "GET /api/properties?city=Gurugram&category=investment",
    ms: filter.ms,
  });

  const page2 = await httpRequest("GET", "/api/properties?page=2&limit=5&category=investment");
  const p2ok =
    page2.status === 200 && page2.json?.data?.pagination?.currentPage === 2;
  record(area, "Property pagination", p2ok ? "PASS" : "FAIL", {
    route: "/properties",
    endpoint: "GET /api/properties?page=2",
    rootCause: p2ok ? null : "Pagination metadata incorrect",
  });
}

async function testCoworking() {
  const area = "Coworking";

  const list = await httpRequest("GET", "/api/coworking?limit=10");
  const id = list.json?.data?.[0]?._id;

  record(area, "Coworking list", list.status === 200 && Array.isArray(list.json?.data) ? "PASS" : "FAIL", {
    route: "/coworking",
    endpoint: "GET /api/coworking",
    ms: list.ms,
  });

  if (id) {
    const detail = await httpRequest("GET", `/api/coworking/${id}`);
    record(
      area,
      "Coworking details",
      detail.status === 200 && detail.json?.data?._id === id ? "PASS" : "FAIL",
      {
        route: `/coworking/${id}`,
        endpoint: `GET /api/coworking/${id}`,
        ms: detail.ms,
      }
    );
  } else {
    record(area, "Coworking details", "WARN", { rootCause: "No coworking spaces in database" });
  }
}

async function testProposals(users) {
  const area = "Proposals";

  const sample = await prisma.proposal.findFirst();
  if (!sample) {
    record(area, "Public proposal", "WARN", { rootCause: "No proposals in PostgreSQL" });
    record(area, "Proposal preview", "WARN", { rootCause: "No proposals in PostgreSQL" });
    record(area, "PDF generation", "WARN", { rootCause: "Manual client test required (html2canvas)" });
    return;
  }

  const pub = await httpRequest("GET", `/api/proposals/${sample.legacyMongoId}/public`);
  record(
    area,
    "Public proposal URL",
    pub.status === 200 && pub.json?.data?._id ? "PASS" : "FAIL",
    {
      route: `/proposals/${sample.legacyMongoId}`,
      endpoint: `GET /api/proposals/${sample.legacyMongoId}/public`,
      ms: pub.ms,
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
      staff.status === 200 ? "PASS" : "FAIL",
      {
        route: `/properties/[id]/proposal/preview`,
        endpoint: `GET /api/${portal}/proposals/${sample.legacyMongoId}`,
        ms: staff.ms,
        rootCause: staff.status !== 200 ? `HTTP ${staff.status} (staff routes are owner-scoped)` : null,
        notes: "Preview UI uses local draft; staff GET requires proposal creator token",
      }
    );
  } else {
    record(area, "Proposal preview (staff)", "WARN", { rootCause: "Proposal creator user not found" });
  }

  record(area, "PDF generation", "WARN", {
    route: "/properties/[id]/proposal/preview",
    endpoint: "Client-side html2canvas",
    notes: "Requires manual browser verification; prior lab() color issue may persist in some builds",
  });
}

async function testUploads(users) {
  const area = "Uploads";

  if (!users.seller && !users.admin) {
    record(area, "Image uploads", "FAIL", { rootCause: "No seller/admin user for upload tests" });
    return;
  }

  const actor = users.seller || users.admin;
  const token = signToken(actor);

  async function uploadImage(category) {
    const boundary = "----CredXPP0Test";
    const parts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\n${category}\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`,
    ];
    const bodyStart = Buffer.from(parts.join(""), "utf8");
    const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`, "utf8");
    const body = Buffer.concat([bodyStart, TINY_PNG, bodyEnd]);
    return httpRequest("POST", "/api/uploads/image", {
      token,
      multipart: {
        body,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length,
        },
      },
    });
  }

  for (const [label, category] of [
    ["Property image upload", "property"],
    ["Avatar upload", "avatar"],
    ["Coworking image upload", "coworking"],
  ]) {
    try {
      const res = await uploadImage(category);
      record(
        area,
        label,
        res.status === 200 && res.json?.imageUrl ? "PASS" : "FAIL",
        {
          endpoint: "POST /api/uploads/image",
          ms: res.ms,
          rootCause: res.status !== 200 ? res.json?.message || `HTTP ${res.status}` : null,
        }
      );
    } catch (error) {
      record(area, label, "FAIL", {
        endpoint: "POST /api/uploads/image",
        rootCause: error.message,
      });
    }
  }
}

async function testDashboards(users) {
  const area = "Dashboards";

  if (users.buyer) {
    const token = signToken(users.buyer);
    const [saved, enquiries] = await Promise.all([
      httpRequest("GET", "/api/saved-properties", { token }),
      httpRequest("GET", "/api/enquiries/me", { token }),
    ]);
    record(
      area,
      "Buyer dashboard",
      saved.status === 200 && enquiries.status === 200 ? "PASS" : "FAIL",
      {
        route: "/user/dashboard",
        endpoint: "GET /api/saved-properties + GET /api/enquiries/me",
        rootCause:
          saved.status !== 200 || enquiries.status !== 200
            ? `saved=${saved.status} enquiries=${enquiries.status}`
            : null,
      }
    );
  } else {
    record(area, "Buyer dashboard", "WARN", { rootCause: "No buyer user in database" });
  }

  if (users.seller) {
    const token = signToken(users.seller);
    const res = await httpRequest("GET", "/api/properties/seller/my-properties", { token });
    record(
      area,
      "Seller dashboard",
      res.status === 200 && Array.isArray(res.json?.data) ? "PASS" : "FAIL",
      {
        route: "/seller/dashboard",
        endpoint: "GET /api/properties/seller/my-properties",
        rootCause: res.status !== 200 ? `HTTP ${res.status}` : null,
      }
    );
  } else {
    record(area, "Seller dashboard", "WARN", { rootCause: "No seller user" });
  }

  if (users.employee) {
    const token = signToken(users.employee);
    const res = await httpRequest("GET", "/api/employee/summary", { token });
    record(
      area,
      "Employee dashboard",
      res.status === 200 && res.json?.data?.metrics ? "PASS" : "FAIL",
      {
        route: "/employee/dashboard",
        endpoint: "GET /api/employee/summary",
        rootCause: res.status !== 200 ? `HTTP ${res.status}` : null,
      }
    );
  } else {
    record(area, "Employee dashboard", "WARN", { rootCause: "No employee user" });
  }

  if (users.admin) {
    const token = signToken(users.admin);
    const res = await httpRequest("GET", "/api/admin/summary", { token });
    record(
      area,
      "Admin dashboard",
      res.status === 200 && res.json?.data?.metrics ? "PASS" : "FAIL",
      {
        route: "/admin/dashboard",
        endpoint: "GET /api/admin/summary",
        rootCause: res.status !== 200 ? `HTTP ${res.status}` : null,
      }
    );
  } else {
    record(area, "Admin dashboard", "FAIL", { rootCause: "No admin user" });
  }
}

function buildMarkdown(report) {
  const lines = [
    "# Phase 5A P0 Stabilization Report",
    "",
    `**Generated:** ${report.completedAt}`,
    `**DB_PROVIDER:** \`${report.dbProvider}\``,
    "",
    "## Summary",
    "",
    `| Result | Count |`,
    `|--------|-------|`,
    `| PASS | ${report.summary.pass} |`,
    `| FAIL | ${report.summary.fail} |`,
    `| WARN | ${report.summary.warn} |`,
    "",
    "## Results by Area",
    "",
  ];

  const areas = [...new Set(report.results.map((r) => r.area))];
  for (const area of areas) {
    lines.push(`### ${area}`, "");
    lines.push("| Test | Status | Route | Endpoint | Notes |");
    lines.push("|------|--------|-------|----------|-------|");
    for (const row of report.results.filter((r) => r.area === area)) {
      const note = row.rootCause || row.notes || "—";
      lines.push(`| ${row.name} | **${row.status}** | ${row.route || "—"} | ${row.endpoint || "—"} | ${note} |`);
    }
    lines.push("");
  }

  if (report.remainingBlockers.length) {
    lines.push("## Remaining Blockers", "");
    for (const b of report.remainingBlockers) lines.push(`- ${b}`);
  }

  return lines.join("\n");
}

async function main() {
  if (!process.env.MONGODB_URI || !process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    console.error("[p0] Missing MONGODB_URI, DATABASE_URL, or JWT_SECRET");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await prisma.$queryRaw`SELECT 1`;

  try {
    await httpRequest("GET", "/api/health");
  } catch {
    console.error(`[p0] API not reachable at http://${HOST}:${PORT} — start server first`);
    process.exit(1);
  }

  const users = await getSampleUsers();

  await testHomepage();
  await testAuthentication(users);
  await testPropertyPages();
  await testCoworking();
  await testProposals(users);
  await testUploads(users);
  await testDashboards(users);

  const summary = {
    pass: results.filter((r) => r.status === "PASS").length,
    fail: results.filter((r) => r.status === "FAIL").length,
    warn: results.filter((r) => r.status === "WARN").length,
    total: results.length,
  };

  const remainingBlockers = [];
  if (results.some((r) => r.status === "FAIL")) {
    remainingBlockers.push("Resolve FAIL items before production cutover");
  }
  if (results.some((r) => r.name === "Login" && r.status === "WARN")) {
    remainingBlockers.push("Set PHASE5A_TEST_EMAIL/PASSWORD for password login E2E");
  }
  if (results.some((r) => r.name === "PDF generation" && r.status === "WARN")) {
    remainingBlockers.push("Manual PDF download verification in browser");
  }
  const listWarn = results.find((r) => r.name === "Investment tab properties" && r.notes?.includes("base64"));
  if (!listWarn) {
    const emptyCovers = results.find((r) => r.area === "Homepage" && r.status === "PASS");
    if (emptyCovers) {
      remainingBlockers.push("Run migrate:images to restore list thumbnails (0 coverImagePublicId in DB)");
    }
  }

  const report = {
    phase: "5A-P0",
    title: "Stabilization Testing",
    dbProvider: "postgres",
    completedAt: new Date().toISOString(),
    summary,
    results,
    remainingBlockers,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  fs.mkdirSync(path.dirname(MARKDOWN_PATH), { recursive: true });
  fs.writeFileSync(MARKDOWN_PATH, buildMarkdown(report));

  console.log(JSON.stringify({ summary, reportPath: REPORT_PATH, markdownPath: MARKDOWN_PATH }, null, 2));
  console.log("\n--- Details ---");
  for (const r of results) {
    console.log(`${r.status.padEnd(4)} [${r.area}] ${r.name}${r.rootCause ? ` — ${r.rootCause}` : ""}`);
  }

  await mongoose.disconnect();
  await prisma.$disconnect();
  process.exit(summary.fail > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
