#!/usr/bin/env node
/**
 * Staging deployment smoke test — API + frontend routes, timings, page captures.
 *
 * Env:
 *   STAGING_API_URL     default http://127.0.0.1:5000/api
 *   STAGING_APP_URL     default http://127.0.0.1:3000 (full feature set incl. /compare)
 *   DEPLOYED_APP_URL    default https://credxp-mvp.vercel.app
 *   STAGING_TEST_EMAIL / STAGING_TEST_PASSWORD (or PHASE5A_*)
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { URL } = require("url");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
process.env.DB_PROVIDER = process.env.DB_PROVIDER || "postgres";

const jwt = require("jsonwebtoken");
const prisma = require("../src/lib/prisma");

const STAGING_API_URL = (process.env.STAGING_API_URL || "http://127.0.0.1:5000/api").replace(/\/$/, "");
const STAGING_APP_URL = (process.env.STAGING_APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const DEPLOYED_APP_URL = (process.env.DEPLOYED_APP_URL || "https://credxp-mvp.vercel.app").replace(/\/$/, "");

const REPORT_JSON = path.join(__dirname, "validate-staging-smoke-report.json");
const REPORT_MD = path.join(__dirname, "..", "..", "docs", "migration", "STAGING_SMOKE_REPORT.md");
const SCREENSHOTS_DIR = path.join(__dirname, "..", "..", "docs", "staging-screenshots");

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const results = [];
let tokens = { admin: null, seller: null, buyer: null };

function record(area, name, status, details = {}) {
  results.push({
    area,
    name,
    status,
    route: details.route || null,
    endpoint: details.endpoint || null,
    ms: details.ms ?? null,
    sizeKb: details.sizeKb ?? null,
    screenshot: details.screenshot || null,
    notes: details.notes || null,
    rootCause: details.rootCause || null,
  });
}

function requestUrl(fullUrl, { method = "GET", headers = {}, body, multipart } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(fullUrl);
    const lib = url.protocol === "https:" ? https : http;
    const start = Date.now();
    const reqHeaders = { ...headers, "User-Agent": "CredXP-StagingSmoke/1.0" };

    let payload = body;
    if (multipart) {
      payload = multipart.body;
      Object.assign(reqHeaders, multipart.headers);
    } else if (body && typeof body === "object") {
      payload = JSON.stringify(body);
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: reqHeaders,
        timeout: 45000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks);
          const text = raw.toString("utf8");
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            json = null;
          }
          resolve({
            status: res.statusCode,
            ms: Date.now() - start,
            sizeKb: Math.round(raw.length / 1024),
            raw,
            text,
            json,
            contentType: res.headers["content-type"] || "",
            hasBase64: raw.includes("data:image/"),
            hasCloudinary: text.includes("res.cloudinary.com/"),
          });
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Timeout: ${fullUrl}`));
    });
    if (payload) req.write(payload);
    req.end();
  });
}

function api(pathSuffix, opts = {}) {
  return requestUrl(`${STAGING_API_URL}${pathSuffix}`, opts);
}

function appPage(baseUrl, route, opts = {}) {
  const url = `${baseUrl}${route}`;
  return requestUrl(url, opts);
}

function signToken(user) {
  return jwt.sign({ id: user.legacyMongoId, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

async function savePageCapture(baseUrl, route, label) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  try {
    const res = await appPage(baseUrl, route);
    const safe = label.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();
    const file = path.join(SCREENSHOTS_DIR, `${safe}.html`);
    fs.writeFileSync(file, res.text, "utf8");
    return { file: path.relative(path.join(__dirname, "..", ".."), file).replace(/\\/g, "/"), status: res.status, ms: res.ms };
  } catch (error) {
    return { file: null, error: error.message };
  }
}

async function loadTokens() {
  const [admin, seller, buyer] = await Promise.all([
    prisma.user.findFirst({ where: { role: "admin" } }),
    prisma.user.findFirst({ where: { role: "seller" } }),
    prisma.user.findFirst({ where: { role: "buyer" } }),
  ]);
  if (admin) tokens.admin = signToken(admin);
  if (seller) tokens.seller = signToken(seller);
  if (buyer) tokens.buyer = signToken(buyer);
}

async function testHomepage() {
  const area = "1. Homepage";
  for (const [label, base] of [
    ["Staging app homepage", STAGING_APP_URL],
    ["Deployed Vercel homepage", DEPLOYED_APP_URL],
  ]) {
    try {
      const cap = await savePageCapture(base, "/", `${label.replace(/\s+/g, "_")}`);
      const res = await appPage(base, "/");
      const ok =
        res.status === 200 &&
        (res.text.includes("CredXP") || res.text.includes("credxp")) &&
        (res.text.includes("Pre-Leased") || res.text.includes("Investment") || res.text.includes("property"));
      record(area, label, ok ? "PASS" : "FAIL", {
        route: "/",
        ms: res.ms,
        sizeKb: res.sizeKb,
        screenshot: cap.file,
        rootCause: ok ? null : `HTTP ${res.status} or missing homepage markers`,
      });
    } catch (error) {
      record(area, label, "FAIL", { route: "/", rootCause: error.message });
    }
  }

  try {
    const insights = await api("/insights?limit=3");
    record(
      area,
      "API insights feed",
      insights.status === 200 && Array.isArray(insights.json?.data) ? "PASS" : "FAIL",
      { endpoint: "GET /api/insights?limit=3", ms: insights.ms, route: "/" }
    );
  } catch (error) {
    record(area, "API insights feed", "FAIL", { endpoint: "GET /api/insights", rootCause: error.message });
  }
}

async function testPropertyListing() {
  const area = "2. Property listing";
  try {
    const cap = await savePageCapture(STAGING_APP_URL, "/invest", "property_listing_invest");
    const page = await appPage(STAGING_APP_URL, "/invest");
    record(area, "Invest page (staging app)", page.status === 200 ? "PASS" : "FAIL", {
      route: "/invest",
      ms: page.ms,
      screenshot: cap.file,
    });
  } catch (error) {
    record(area, "Invest page (staging app)", "FAIL", { route: "/invest", rootCause: error.message });
  }

  try {
    const list = await api("/properties?page=1&limit=20&sort=newest&category=investment");
    const count = list.json?.data?.properties?.length ?? 0;
    record(
      area,
      "Investment properties API",
      list.status === 200 && count > 0 && !list.hasBase64 ? "PASS" : "FAIL",
      {
        endpoint: "GET /api/properties?category=investment",
        route: "/invest",
        ms: list.ms,
        sizeKb: list.sizeKb,
        notes: `${count} properties, cloudinary=${list.hasCloudinary}`,
        rootCause: list.hasBase64 ? "List contains base64" : count === 0 ? "Empty list" : null,
      }
    );
    return list.json?.data?.properties?.[0]?._id || null;
  } catch (error) {
    record(area, "Investment properties API", "FAIL", { rootCause: error.message });
    return null;
  }
}

async function testPropertyDetail(propertyId) {
  const area = "3. Property detail";
  if (!propertyId) {
    record(area, "Property detail", "FAIL", { rootCause: "No property id from listing" });
    return;
  }

  const route = `/properties/${propertyId}`;
  try {
    const cap = await savePageCapture(STAGING_APP_URL, route, "property_detail");
    const page = await appPage(STAGING_APP_URL, route);
    record(area, "Property detail page", page.status === 200 ? "PASS" : "FAIL", {
      route,
      ms: page.ms,
      screenshot: cap.file,
    });
  } catch (error) {
    record(area, "Property detail page", "FAIL", { route, rootCause: error.message });
  }

  try {
    const detail = await api(`/properties/${propertyId}`);
    const ok =
      detail.status === 200 &&
      detail.json?.data?._id === propertyId &&
      !detail.hasBase64;
    record(area, "Property detail API", ok ? "PASS" : "WARN", {
      endpoint: `GET /api/properties/${propertyId}`,
      route,
      ms: detail.ms,
      sizeKb: detail.sizeKb,
      notes: ok ? "Cloudinary/detail payload OK" : detail.hasBase64 ? "Detail may include legacy base64" : "HTTP error",
    });
  } catch (error) {
    record(area, "Property detail API", "FAIL", { rootCause: error.message });
  }
}

async function testComparisonPage() {
  const area = "4. Comparison page";
  try {
    const cap = await savePageCapture(STAGING_APP_URL, "/compare", "comparison_page");
    const page = await appPage(STAGING_APP_URL, "/compare");
    const ok = page.status === 200 && page.text.includes("Compare Investment");
    record(area, "Compare page (staging app)", ok ? "PASS" : "FAIL", {
      route: "/compare",
      ms: page.ms,
      screenshot: cap.file,
      rootCause: page.status === 404 ? "Route not deployed — redeploy frontend" : null,
    });
  } catch (error) {
    record(area, "Compare page (staging app)", "FAIL", { route: "/compare", rootCause: error.message });
  }

  try {
    const deployed = await appPage(DEPLOYED_APP_URL, "/compare");
    record(
      area,
      "Compare page (Vercel deployed)",
      deployed.status === 200 ? "PASS" : "WARN",
      {
        route: "/compare",
        ms: deployed.ms,
        rootCause: deployed.status === 404 ? "/compare not yet on Vercel — deploy latest client" : null,
      }
    );
  } catch (error) {
    record(area, "Compare page (Vercel deployed)", "WARN", { rootCause: error.message });
  }
}

async function testCoworking() {
  const area = "5. Coworking";
  try {
    const cap = await savePageCapture(STAGING_APP_URL, "/coworking", "coworking_list");
    const page = await appPage(STAGING_APP_URL, "/coworking");
    record(area, "Coworking page", page.status === 200 ? "PASS" : "FAIL", {
      route: "/coworking",
      ms: page.ms,
      screenshot: cap.file,
    });
  } catch (error) {
    record(area, "Coworking page", "FAIL", { rootCause: error.message });
  }

  try {
    const list = await api("/coworking?limit=10");
    const id = list.json?.data?.[0]?._id;
    record(
      area,
      "Coworking list API",
      list.status === 200 && Array.isArray(list.json?.data) ? "PASS" : "FAIL",
      { endpoint: "GET /api/coworking", route: "/coworking", ms: list.ms }
    );
    if (id) {
      const detail = await api(`/coworking/${id}`);
      record(
        area,
        "Coworking detail API",
        detail.status === 200 ? "PASS" : "FAIL",
        { endpoint: `GET /api/coworking/${id}`, ms: detail.ms }
      );
    }
  } catch (error) {
    record(area, "Coworking API", "FAIL", { rootCause: error.message });
  }
}

async function testAuthentication() {
  const area = "6. Authentication";
  const email = process.env.STAGING_TEST_EMAIL || process.env.PHASE5A_TEST_EMAIL;
  const password = process.env.STAGING_TEST_PASSWORD || process.env.PHASE5A_TEST_PASSWORD;

  try {
    const cap = await savePageCapture(STAGING_APP_URL, "/login", "login_page");
    const page = await appPage(STAGING_APP_URL, "/login");
    record(area, "Login page", page.status === 200 ? "PASS" : "FAIL", {
      route: "/login",
      ms: page.ms,
      screenshot: cap.file,
    });
  } catch (error) {
    record(area, "Login page", "FAIL", { rootCause: error.message });
  }

  if (email && password) {
    try {
      const login = await api("/auth/login", { method: "POST", body: { email, password } });
      record(
        area,
        "Login API",
        login.status === 200 && login.json?.data?.token ? "PASS" : "FAIL",
        { endpoint: "POST /api/auth/login", route: "/login", ms: login.ms, rootCause: login.json?.message }
      );
      if (login.json?.data?.token) {
        const me = await api("/auth/me", { headers: { Authorization: `Bearer ${login.json.data.token}` } });
        record(area, "GET /api/auth/me", me.status === 200 ? "PASS" : "FAIL", {
          endpoint: "GET /api/auth/me",
          ms: me.ms,
        });
      }
    } catch (error) {
      record(area, "Login API", "FAIL", { rootCause: error.message });
    }
  } else if (tokens.buyer) {
    const me = await api("/auth/me", { headers: { Authorization: `Bearer ${tokens.buyer}` } });
    record(area, "GET /api/auth/me (JWT)", me.status === 200 ? "PASS" : "FAIL", {
      endpoint: "GET /api/auth/me",
      ms: me.ms,
      notes: "Password E2E skipped — used signed JWT",
    });
    record(area, "Login API E2E", "WARN", {
      route: "/login",
      rootCause: "Set STAGING_TEST_EMAIL/PASSWORD for password login E2E",
    });
  } else {
    record(area, "Authentication", "FAIL", { rootCause: "No test credentials or buyer user" });
  }
}

async function testSellerDashboard() {
  const area = "7. Seller dashboard";
  if (!tokens.seller) {
    record(area, "Seller my-properties", "FAIL", { rootCause: "No seller user in database" });
    return;
  }
  try {
    const cap = await savePageCapture(STAGING_APP_URL, "/seller/dashboard", "seller_dashboard");
    const page = await appPage(STAGING_APP_URL, "/seller/dashboard");
    record(area, "Seller dashboard page", page.status === 200 ? "PASS" : "FAIL", {
      route: "/seller/dashboard",
      ms: page.ms,
      screenshot: cap.file,
    });
  } catch (error) {
    record(area, "Seller dashboard page", "FAIL", { rootCause: error.message });
  }

  try {
    const res = await api("/properties/seller/my-properties", {
      headers: { Authorization: `Bearer ${tokens.seller}` },
    });
    record(
      area,
      "Seller my-properties API",
      res.status === 200 && Array.isArray(res.json?.data) ? "PASS" : "FAIL",
      {
        endpoint: "GET /api/properties/seller/my-properties",
        route: "/seller/dashboard",
        ms: res.ms,
      }
    );
  } catch (error) {
    record(area, "Seller my-properties API", "FAIL", { rootCause: error.message });
  }
}

async function testAdminDashboard() {
  const area = "8. Admin dashboard";
  if (!tokens.admin) {
    record(area, "Admin summary", "FAIL", { rootCause: "No admin user" });
    return;
  }

  try {
    const cap = await savePageCapture(STAGING_APP_URL, "/admin/dashboard", "admin_dashboard");
    const page = await appPage(STAGING_APP_URL, "/admin/dashboard");
    record(area, "Admin dashboard page", page.status === 200 ? "PASS" : "FAIL", {
      route: "/admin/dashboard",
      ms: page.ms,
      screenshot: cap.file,
    });
  } catch (error) {
    record(area, "Admin dashboard page", "FAIL", { rootCause: error.message });
  }

  try {
    const [summary, properties] = await Promise.all([
      api("/admin/summary", { headers: { Authorization: `Bearer ${tokens.admin}` } }),
      api("/admin/properties", { headers: { Authorization: `Bearer ${tokens.admin}` } }),
    ]);
    record(
      area,
      "Admin summary API",
      summary.status === 200 && summary.json?.data?.metrics ? "PASS" : "FAIL",
      { endpoint: "GET /api/admin/summary", route: "/admin/dashboard", ms: summary.ms }
    );
    record(
      area,
      "Admin properties API",
      properties.status === 200 && !properties.hasBase64 ? "PASS" : "FAIL",
      {
        endpoint: "GET /api/admin/properties",
        ms: properties.ms,
        sizeKb: properties.sizeKb,
        rootCause: properties.hasBase64 ? "Admin list contains base64" : null,
      }
    );
  } catch (error) {
    record(area, "Admin APIs", "FAIL", { rootCause: error.message });
  }
}

async function testProposals() {
  const area = "9. Proposal preview";
  const sample = await prisma.proposal.findFirst({ orderBy: { createdAt: "desc" } });
  if (!sample) {
    record(area, "Proposal preview", "WARN", { rootCause: "No proposals in database" });
    record(area, "Proposal PDF", "WARN", { rootCause: "No proposals" });
    return;
  }

  const creator = await prisma.user.findUnique({ where: { id: sample.createdById } });
  const portal = creator?.role === "employee" ? "employee" : "admin";
  const token = creator ? signToken(creator) : tokens.admin;

  try {
    const pub = await api(`/proposals/${sample.legacyMongoId}/public`);
    record(
      area,
      "Public proposal API",
      pub.status === 200 && pub.json?.data?.propertyTitle ? "PASS" : "FAIL",
      {
        endpoint: `GET /api/proposals/${sample.legacyMongoId}/public`,
        route: `/proposals/${sample.legacyMongoId}`,
        ms: pub.ms,
      }
    );

    const cap = await savePageCapture(STAGING_APP_URL, `/proposals/${sample.legacyMongoId}`, "proposal_public_page");
    const page = await appPage(STAGING_APP_URL, `/proposals/${sample.legacyMongoId}`);
    record(area, "Public proposal page", page.status === 200 ? "PASS" : "FAIL", {
      route: `/proposals/${sample.legacyMongoId}`,
      ms: page.ms,
      screenshot: cap.file,
    });
  } catch (error) {
    record(area, "Public proposal", "FAIL", { rootCause: error.message });
  }

  if (token) {
    try {
      const staff = await api(`/${portal}/proposals/${sample.legacyMongoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      record(
        area,
        "Proposal preview API (staff)",
        staff.status === 200 ? "PASS" : "FAIL",
        {
          endpoint: `GET /api/${portal}/proposals/${sample.legacyMongoId}`,
          route: "/properties/[id]/proposal/preview",
          ms: staff.ms,
        }
      );
    } catch (error) {
      record(area, "Proposal preview API", "FAIL", { rootCause: error.message });
    }
  }

  record(area, "Proposal PDF generation", "WARN", {
    route: "/properties/[id]/proposal/preview",
    notes: "Client-side html2canvas/jspdf — manual browser verification required",
  });
}

async function testImageRendering(propertyId) {
  const area = "11. Image rendering";
  try {
    const list = await api("/properties?page=1&limit=20&category=investment");
    const items = list.json?.data?.properties || [];
    const withThumb = items.filter(
      (p) =>
        (typeof p.coverImage === "string" && p.coverImage.includes("res.cloudinary.com/")) ||
        p.coverImagePublicId
    ).length;
    record(
      area,
      "List thumbnails (Cloudinary)",
      list.status === 200 && withThumb > 0 && !list.hasBase64 ? "PASS" : "FAIL",
      {
        endpoint: "GET /api/properties?category=investment",
        route: "/invest",
        ms: list.ms,
        notes: `${withThumb}/${items.length} items with Cloudinary thumbnail`,
      }
    );
  } catch (error) {
    record(area, "List thumbnails", "FAIL", { rootCause: error.message });
  }

  if (propertyId) {
    try {
      const detail = await api(`/properties/${propertyId}`);
      const images = detail.json?.data?.images || [];
      const cloudCount = images.filter((i) => typeof i === "string" && i.includes("res.cloudinary.com/")).length;
      record(
        area,
        "Detail gallery images",
        detail.status === 200 && cloudCount > 0 ? "PASS" : "WARN",
        {
          endpoint: `GET /api/properties/${propertyId}`,
          notes: `${cloudCount}/${images.length} Cloudinary gallery URLs`,
        }
      );
    } catch (error) {
      record(area, "Detail gallery images", "FAIL", { rootCause: error.message });
    }
  }
}

async function testUploads() {
  const area = "12. Upload flows";
  const actor = tokens.seller || tokens.admin;
  if (!actor) {
    record(area, "Image upload", "FAIL", { rootCause: "No seller/admin token" });
    return;
  }

  async function upload(category) {
    const boundary = "----CredXPStagingSmoke";
    const parts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\n${category}\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="smoke.png"\r\nContent-Type: image/png\r\n\r\n`,
    ];
    const body = Buffer.concat([
      Buffer.from(parts.join(""), "utf8"),
      TINY_PNG,
      Buffer.from(`\r\n--${boundary}--\r\n`, "utf8"),
    ]);
    return api("/uploads/image", {
      method: "POST",
      headers: { Authorization: `Bearer ${actor}` },
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
      const res = await upload(category);
      record(
        area,
        label,
        res.status === 200 && res.json?.imageUrl?.includes("res.cloudinary.com/") ? "PASS" : "FAIL",
        {
          endpoint: "POST /api/uploads/image",
          ms: res.ms,
          notes: res.json?.publicId ? `publicId=${res.json.publicId}` : null,
          rootCause: res.status !== 200 ? res.json?.message || `HTTP ${res.status}` : null,
        }
      );
    } catch (error) {
      record(area, label, "FAIL", { rootCause: error.message });
    }
  }
}

function buildMarkdown(report) {
  const lines = [
    "# Staging Smoke Test Report",
    "",
    `**Generated:** ${report.completedAt}`,
    `**Staging API:** \`${report.config.stagingApiUrl}\``,
    `**Staging App:** \`${report.config.stagingAppUrl}\``,
    `**Deployed App (Vercel):** \`${report.config.deployedAppUrl}\``,
    `**DB_PROVIDER:** \`${report.config.dbProvider}\``,
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
    "| Area | Test | Status | Route | Endpoint | Time (ms) | Screenshot | Notes |",
    "|------|------|--------|-------|----------|-----------|------------|-------|",
  ];

  for (const row of report.results) {
    const note = row.rootCause || row.notes || "—";
    lines.push(
      `| ${row.area} | ${row.name} | **${row.status}** | ${row.route || "—"} | ${row.endpoint || "—"} | ${row.ms ?? "—"} | ${row.screenshot || "—"} | ${note} |`
    );
  }

  if (report.remainingBlockers.length) {
    lines.push("", "## Remaining Blockers", "");
    for (const b of report.remainingBlockers) lines.push(`- ${b}`);
  }

  lines.push("", "## Page captures", "", `HTML snapshots saved to \`docs/staging-screenshots/\` (open in browser to preview).`);

  return lines.join("\n");
}

async function main() {
  if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
    console.error("[staging-smoke] JWT_SECRET and DATABASE_URL required");
    process.exit(1);
  }

  await prisma.$queryRaw`SELECT 1`;

  try {
    const health = await api("/health");
    if (health.status !== 200) throw new Error(`API health HTTP ${health.status}`);
  } catch (error) {
    console.error(`[staging-smoke] Staging API unreachable at ${STAGING_API_URL}: ${error.message}`);
    console.error("Start server: cd server && node src/server.js");
    process.exit(1);
  }

  await loadTokens();

  await testHomepage();
  const propertyId = await testPropertyListing();
  await testPropertyDetail(propertyId);
  await testComparisonPage();
  await testCoworking();
  await testAuthentication();
  await testSellerDashboard();
  await testAdminDashboard();
  await testProposals();
  await testImageRendering(propertyId);
  await testUploads();

  const summary = {
    pass: results.filter((r) => r.status === "PASS").length,
    fail: results.filter((r) => r.status === "FAIL").length,
    warn: results.filter((r) => r.status === "WARN").length,
    total: results.length,
  };

  const remainingBlockers = [];
  if (summary.fail > 0) remainingBlockers.push(`${summary.fail} smoke test(s) failed`);
  if (results.some((r) => r.name.includes("Vercel") && r.status === "WARN")) {
    remainingBlockers.push("Redeploy Vercel frontend with latest client (e.g. /compare route)");
  }
  if (results.some((r) => r.name === "Login API E2E" && r.status === "WARN")) {
    remainingBlockers.push("Configure STAGING_TEST_EMAIL/PASSWORD for login E2E");
  }
  if (results.some((r) => r.name === "Proposal PDF generation" && r.status === "WARN")) {
    remainingBlockers.push("Manual proposal PDF download verification in browser");
  }

  const report = {
    phase: "staging-smoke",
    completedAt: new Date().toISOString(),
    config: {
      stagingApiUrl: STAGING_API_URL,
      stagingAppUrl: STAGING_APP_URL,
      deployedAppUrl: DEPLOYED_APP_URL,
      dbProvider: process.env.DB_PROVIDER,
    },
    summary,
    results,
    remainingBlockers,
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
  fs.mkdirSync(path.dirname(REPORT_MD), { recursive: true });
  fs.writeFileSync(REPORT_MD, buildMarkdown(report));

  console.log(JSON.stringify({ summary, reportMd: REPORT_MD, screenshotsDir: SCREENSHOTS_DIR }, null, 2));
  console.log("\n--- Results ---");
  for (const r of results) {
    console.log(`${r.status.padEnd(4)} [${r.area}] ${r.name} ${r.ms != null ? `${r.ms}ms` : ""}${r.rootCause ? ` — ${r.rootCause}` : ""}`);
  }

  await prisma.$disconnect();
  process.exit(summary.fail > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
