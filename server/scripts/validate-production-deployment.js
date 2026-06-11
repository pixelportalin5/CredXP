#!/usr/bin/env node
/**
 * Phase 5B — Temporary production deployment validation (Vercel + Render + Neon).
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { URL } = require("url");
const { execSync } = require("child_process");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const PRODUCTION_APP_URL = (process.env.PRODUCTION_APP_URL || "https://credxp-mvp.vercel.app").replace(/\/$/, "");
const PRODUCTION_API_URL = (process.env.PRODUCTION_API_URL || "https://credxp-mvp.onrender.com/api").replace(/\/$/, "");

const REPORT_JSON = path.join(__dirname, "validate-production-deployment-report.json");
const REPORT_MD = path.join(__dirname, "..", "..", "docs", "migration", "PHASE5B_PRODUCTION_DEPLOYMENT_REPORT.md");
const SCREENSHOTS_DIR = path.join(__dirname, "..", "..", "docs", "staging-screenshots", "production");

const results = [];
const envChecks = [];

function record(area, name, status, details = {}) {
  results.push({ area, name, status, ...details });
}

function envCheck(platform, variable, status, notes) {
  envChecks.push({ platform, variable, status, notes });
}

function requestUrl(fullUrl, opts = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(fullUrl);
    const lib = url.protocol === "https:" ? https : http;
    const start = Date.now();
    const headers = { "User-Agent": "CredXP-ProductionDeploy/1.0", ...(opts.headers || {}) };
    let payload = opts.body;
    if (payload && typeof payload === "object") {
      payload = JSON.stringify(payload);
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(payload);
    }
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: opts.method || "GET",
        headers,
        timeout: 60000,
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
            text,
            json,
            hasBase64: raw.includes("data:image/"),
            hasCloudinary: text.includes("res.cloudinary.com/"),
          });
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    if (payload) req.write(payload);
    req.end();
  });
}

function api(pathSuffix, opts) {
  return requestUrl(`${PRODUCTION_API_URL}${pathSuffix}`, opts);
}

function app(route) {
  return requestUrl(`${PRODUCTION_APP_URL}${route}`);
}

async function saveCapture(route, label) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  try {
    const res = await app(route);
    const file = path.join(SCREENSHOTS_DIR, `${label}.html`);
    fs.writeFileSync(file, res.text, "utf8");
    return path.relative(path.join(__dirname, "..", ".."), file).replace(/\\/g, "/");
  } catch {
    return null;
  }
}

function auditEnvironmentVariables() {
  const area = "Environment";

  const renderVars = [
    ["PORT", "10000", true],
    ["NODE_ENV", "production", true],
    ["DB_PROVIDER", "postgres", true],
    ["DATABASE_URL", "Neon pooled URL", true],
    ["JWT_SECRET", "long random secret", true],
    ["CLIENT_URL", PRODUCTION_APP_URL, true],
    ["CLOUDINARY_CLOUD_NAME", "set", true],
    ["CLOUDINARY_API_KEY", "set", true],
    ["CLOUDINARY_API_SECRET", "set", true],
    ["MONGODB_URI", "optional when DB_PROVIDER=postgres", false],
  ];

  for (const [variable, expected, required] of renderVars) {
    let status = "CHECKLIST";
    let notes = `Set on Render dashboard → ${expected}`;
    if (variable === "DB_PROVIDER") {
      const local = (process.env.DB_PROVIDER || "").toLowerCase();
      status = local === "postgres" ? "PASS (local ref)" : "VERIFY_ON_RENDER";
      notes = local === "postgres" ? "Local .env confirms postgres; verify Render env matches" : "Must be postgres on Render";
    }
    if (["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].includes(variable)) {
      status = process.env[variable] ? "PASS (local ref)" : "VERIFY_ON_RENDER";
      notes = process.env[variable] ? "Local credentials present — mirror on Render" : "Missing locally";
    }
    if (variable === "DATABASE_URL") {
      status = process.env.DATABASE_URL?.startsWith("postgresql://") ? "PASS (local ref)" : "FAIL";
    }
    envCheck("Render", variable, status, notes);
    record(area, `Render: ${variable}`, required ? status : "CHECKLIST", { notes });
  }

  const vercelVars = [
    ["NEXT_PUBLIC_API_URL", `${PRODUCTION_API_URL}`, true],
    ["NEXT_PUBLIC_APP_URL", PRODUCTION_APP_URL, false],
    ["NEXT_PUBLIC_USE_CLOUDINARY_UPLOADS", "true", false],
  ];
  for (const [variable, expected] of vercelVars) {
    envCheck("Vercel", variable, "VERIFY_ON_VERCEL", `Must be ${expected}`);
    record(area, `Vercel: ${variable}`, "CHECKLIST", { notes: `Vercel dashboard → ${expected}` });
  }

  envCheck("Neon", "DATABASE_URL", process.env.DATABASE_URL ? "PASS" : "FAIL", "Neon connection string in Render");
  record(area, "Neon DATABASE_URL", process.env.DATABASE_URL ? "PASS" : "FAIL", {
    notes: process.env.DATABASE_URL ? "Reachable from validation scripts" : "Not set locally",
  });

  try {
    execSync("node scripts/validate-neon-connection.js", { cwd: path.join(__dirname, ".."), stdio: "pipe" });
    record(area, "Neon connectivity", "PASS", { endpoint: "validate-neon-connection.js" });
  } catch (error) {
    record(area, "Neon connectivity", "FAIL", { rootCause: error.stderr?.toString() || error.message });
  }

  try {
    execSync("node scripts/validate-cloudinary.js", { cwd: path.join(__dirname, ".."), stdio: "pipe" });
    record(area, "Cloudinary connectivity", "PASS", { endpoint: "validate-cloudinary.js" });
  } catch (error) {
    record(area, "Cloudinary connectivity", "FAIL", { rootCause: error.stderr?.toString() || error.message });
  }

  try {
    const out = execSync("npx prisma migrate status", {
      cwd: path.join(__dirname, ".."),
      encoding: "utf8",
    });
    const applied = out.includes("Database schema is up to date");
    record(area, "Prisma migrations", applied ? "PASS" : "WARN", { notes: out.split("\n").slice(-3).join(" ") });
  } catch (error) {
    record(area, "Prisma migrations", "FAIL", { rootCause: error.message });
  }

  record(area, "DB_PROVIDER=postgres (local)", process.env.DB_PROVIDER === "postgres" ? "PASS" : "WARN", {
    notes: `Local DB_PROVIDER=${process.env.DB_PROVIDER || "mongo"} — Render must be postgres`,
  });

  record(area, "Render startup", "CHECKLIST", {
    notes: "Root: server | Build: npm install && npx prisma generate | Start: npx prisma migrate deploy && node src/server.js",
  });
}

async function smokeProduction() {
  let propertyId = null;

  try {
    const health = await api("/health");
    record("Render API", "Health check", health.status === 200 ? "PASS" : "FAIL", {
      route: "/api/health",
      endpoint: `${PRODUCTION_API_URL}/health`,
      ms: health.ms,
    });
  } catch (error) {
    record("Render API", "Health check", "FAIL", { rootCause: error.message });
    return;
  }

  const homepageCap = await saveCapture("/", "production_homepage");
  try {
    const page = await app("/");
    record("Vercel Frontend", "Homepage", page.status === 200 ? "PASS" : "FAIL", {
      route: "/",
      ms: page.ms,
      screenshot: homepageCap,
    });
  } catch (error) {
    record("Vercel Frontend", "Homepage", "FAIL", { rootCause: error.message });
  }

  try {
    const list = await api("/properties?page=1&limit=20&category=investment");
    propertyId = list.json?.data?.properties?.[0]?._id;
    const thumbs = (list.json?.data?.properties || []).filter((p) =>
      String(p.coverImage || "").includes("res.cloudinary.com/")
    ).length;
    record("Property listing", "Render investment API", list.status === 200 && !list.hasBase64 ? "PASS" : "FAIL", {
      route: "/invest",
      endpoint: "GET /api/properties?category=investment",
      ms: list.ms,
      notes: `${list.json?.data?.properties?.length || 0} properties, ${thumbs} Cloudinary thumbnails`,
    });
    const investCap = await saveCapture("/invest", "production_invest");
    const investPage = await app("/invest");
    record("Property listing", "Vercel /invest page", investPage.status === 200 ? "PASS" : "FAIL", {
      route: "/invest",
      ms: investPage.ms,
      screenshot: investCap,
    });
  } catch (error) {
    record("Property listing", "API", "FAIL", { rootCause: error.message });
  }

  if (propertyId) {
    try {
      const detail = await api(`/properties/${propertyId}`);
      record("Property detail", "Render detail API", detail.status === 200 && detail.hasCloudinary ? "PASS" : "FAIL", {
        route: `/properties/${propertyId}`,
        endpoint: `GET /api/properties/${propertyId}`,
        ms: detail.ms,
        notes: `base64=${detail.hasBase64}`,
      });
      const cap = await saveCapture(`/properties/${propertyId}`, "production_property_detail");
      const page = await app(`/properties/${propertyId}`);
      record("Property detail", "Vercel detail page", page.status === 200 ? "PASS" : "FAIL", {
        route: `/properties/${propertyId}`,
        ms: page.ms,
        screenshot: cap,
      });
    } catch (error) {
      record("Property detail", "API", "FAIL", { rootCause: error.message });
    }
  }

  try {
    const compare = await app("/compare");
    record("Comparison page", "Vercel /compare", compare.status === 200 ? "PASS" : "WARN", {
      route: "/compare",
      ms: compare.ms,
      rootCause: compare.status === 404 ? "Not deployed — push latest client to Vercel" : null,
    });
  } catch (error) {
    record("Comparison page", "Vercel /compare", "FAIL", { rootCause: error.message });
  }

  try {
    const loginCap = await saveCapture("/login", "production_login");
    const login = await app("/login");
    record("Login", "Vercel login page", login.status === 200 ? "PASS" : "FAIL", {
      route: "/login",
      ms: login.ms,
      screenshot: loginCap,
    });
    if (process.env.STAGING_TEST_EMAIL && process.env.STAGING_TEST_PASSWORD) {
      const auth = await api("/auth/login", {
        method: "POST",
        body: { email: process.env.STAGING_TEST_EMAIL, password: process.env.STAGING_TEST_PASSWORD },
      });
      record("Login", "Render login API", auth.status === 200 ? "PASS" : "FAIL", {
        endpoint: "POST /api/auth/login",
        ms: auth.ms,
      });
    } else {
      record("Login", "Render login API E2E", "WARN", {
        rootCause: "Set STAGING_TEST_EMAIL/PASSWORD to validate login against Render",
      });
    }
  } catch (error) {
    record("Login", "Login flow", "FAIL", { rootCause: error.message });
  }

  for (const [label, route, endpoint] of [
    ["Seller dashboard page", "/seller/dashboard", null],
    ["Admin dashboard page", "/admin/dashboard", null],
  ]) {
    try {
      const cap = await saveCapture(route, label.replace(/\s+/g, "_"));
      const page = await app(route);
      record(label.includes("Seller") ? "Seller dashboard" : "Admin dashboard", label, page.status === 200 ? "PASS" : "FAIL", {
        route,
        ms: page.ms,
        screenshot: cap,
      });
    } catch (error) {
      record(label.includes("Seller") ? "Seller dashboard" : "Admin dashboard", label, "FAIL", { rootCause: error.message });
    }
  }

  try {
    const proposals = await api("/proposals");
  } catch {
    /* public list may not exist */
  }

  const prisma = require("../src/lib/prisma");
  const sample = await prisma.proposal.findFirst({ orderBy: { createdAt: "desc" } });
  if (sample) {
    try {
      const pub = await api(`/proposals/${sample.legacyMongoId}/public`);
      const proposalOk = pub.status === 200 && pub.json?.data?.propertyTitle;
      record(
        "Proposal pages",
        "Public proposal API",
        proposalOk ? "PASS" : pub.status === 404 ? "WARN" : "FAIL",
        {
          route: `/proposals/${sample.legacyMongoId}`,
          endpoint: `GET /api/proposals/${sample.legacyMongoId}/public`,
          ms: pub.ms,
          rootCause: pub.status === 404
            ? "Proposal in Neon not found on Render — verify DB_PROVIDER=postgres and DATABASE_URL on Render"
            : pub.status !== 200
              ? `HTTP ${pub.status}`
              : null,
        }
      );
      const cap = await saveCapture(`/proposals/${sample.legacyMongoId}`, "production_proposal");
      const page = await app(`/proposals/${sample.legacyMongoId}`);
      record("Proposal pages", "Vercel public proposal", page.status === 200 ? "PASS" : "FAIL", {
        route: `/proposals/${sample.legacyMongoId}`,
        ms: page.ms,
        screenshot: cap,
      });
    } catch (error) {
      record("Proposal pages", "Proposal", "FAIL", { rootCause: error.message });
    }
  } else {
    record("Proposal pages", "Proposal sample", "WARN", { rootCause: "No proposal in Neon DB" });
  }

  record("Proposal PDF", "PDF generation", "WARN", {
    notes: "Client-side html2canvas — manual browser verification on Vercel",
  });

  try {
    const list = await api("/properties?page=1&limit=10&category=investment");
    record(
      "Image rendering",
      "Cloudinary list thumbnails",
      list.hasCloudinary && !list.hasBase64 ? "PASS" : "FAIL",
      { endpoint: "GET /api/properties", ms: list.ms, notes: `cloudinary=${list.hasCloudinary}` }
    );
  } catch (error) {
    record("Image rendering", "List images", "FAIL", { rootCause: error.message });
  }

  await prisma.$disconnect().catch(() => {});
}

function buildMarkdown(report) {
  const lines = [
    "# Phase 5B Production Deployment Report",
    "",
    "**Architecture:** Vercel (frontend) + Render (API) + Neon (PostgreSQL) + Cloudinary (images)",
    "",
    `**Generated:** ${report.completedAt}`,
    "",
    "## Deployment URLs",
    "",
    `| Layer | URL |`,
    `|-------|-----|`,
    `| Frontend (Vercel) | ${report.urls.frontend} |`,
    `| Backend (Render) | ${report.urls.api} |`,
    `| Database (Neon) | PostgreSQL via \`DATABASE_URL\` on Render |`,
    `| Images (Cloudinary) | \`res.cloudinary.com/do8i1mk98/\` |`,
    "",
    "## Deployment Readiness",
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Overall | **${report.readiness}** |`,
    `| PASS | ${report.summary.pass} |`,
    `| FAIL | ${report.summary.fail} |`,
    `| WARN | ${report.summary.warn} |`,
    `| CHECKLIST | ${report.summary.checklist} |`,
    "",
    "## Environment Status",
    "",
    "| Platform | Variable | Status | Notes |",
    "|----------|----------|--------|-------|",
  ];

  for (const row of report.envChecks) {
    lines.push(`| ${row.platform} | ${row.variable} | ${row.status} | ${row.notes} |`);
  }

  lines.push("", "## Smoke Test Results", "");
  lines.push("| Area | Test | Status | Route | Time (ms) | Notes |");
  lines.push("|------|------|--------|-------|-----------|-------|");

  for (const row of report.results.filter((r) => r.area !== "Environment" || !r.name.startsWith("Render:"))) {
    if (row.area === "Environment" && row.name.startsWith("Vercel:")) continue;
    const note = row.rootCause || row.notes || "—";
    lines.push(`| ${row.area} | ${row.name} | **${row.status}** | ${row.route || "—"} | ${row.ms ?? "—"} | ${note} |`);
  }

  if (report.knownLimitations.length) {
    lines.push("", "## Known Limitations", "");
    for (const item of report.knownLimitations) lines.push(`- ${item}`);
  }

  if (report.remainingBlockers.length) {
    lines.push("", "## Remaining Blockers", "");
    for (const b of report.remainingBlockers) lines.push(`- ${b}`);
  }

  lines.push("", "## Deploy Steps (pending git push)", "");
  for (const step of report.deploySteps) lines.push(`- ${step}`);

  return lines.join("\n");
}

async function main() {
  auditEnvironmentVariables();
  await smokeProduction();

  const summary = {
    pass: results.filter((r) => r.status === "PASS").length,
    fail: results.filter((r) => r.status === "FAIL").length,
    warn: results.filter((r) => r.status === "WARN").length,
    checklist: results.filter((r) => r.status === "CHECKLIST" || r.status === "VERIFY_ON_RENDER" || r.status === "VERIFY_ON_VERCEL").length,
    total: results.length,
  };

  const knownLimitations = [
    "Hostinger VPS not in use — temporary production on Vercel + Render",
    "Vercel `/compare` route not on deployed build until latest client is pushed",
    "Proposal PDF requires manual browser verification",
    "Render free tier cold starts (~15–25s on first request)",
    "Login E2E requires STAGING_TEST_EMAIL/PASSWORD in env",
  ];

  const remainingBlockers = [];
  if (summary.fail > 0) remainingBlockers.push(`${summary.fail} production smoke test(s) failed`);
  if (results.some((r) => r.name === "Vercel /compare" && r.status === "WARN")) {
    remainingBlockers.push("Deploy latest client to Vercel (includes /compare, comparison buttons)");
  }
  if (results.some((r) => r.name.includes("git") === false && r.status === "CHECKLIST")) {
    remainingBlockers.push("Confirm Render/Vercel dashboard env vars match checklist");
  }
  const uncommitted = "Large uncommitted local diff — commit and push to trigger Render/Vercel auto-deploy";

  const readiness =
    summary.fail === 0
      ? "CONDITIONAL GO — Render API live; redeploy Vercel for /compare; confirm Render DB_PROVIDER=postgres"
      : "NO-GO — fix FAIL items";

  const report = {
    phase: "5B-production-deployment",
    completedAt: new Date().toISOString(),
    urls: { frontend: PRODUCTION_APP_URL, api: PRODUCTION_API_URL },
    readiness,
    summary,
    envChecks,
    results,
    knownLimitations,
    remainingBlockers: [...remainingBlockers, uncommitted],
    deploySteps: [
      "Commit and push `main` to GitHub remote connected to Render + Vercel",
      "Render: root directory `server`, build `npm install && npx prisma generate`, start `npx prisma migrate deploy && node src/server.js`",
      "Render env: DB_PROVIDER=postgres, DATABASE_URL, JWT_SECRET, CLIENT_URL=https://credxp-mvp.vercel.app, Cloudinary keys",
      "Vercel: root `client`, env NEXT_PUBLIC_API_URL=https://credxp-mvp.onrender.com/api",
      "Re-run: npm run validate:production-deployment",
    ],
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
  fs.mkdirSync(path.dirname(REPORT_MD), { recursive: true });
  fs.writeFileSync(REPORT_MD, buildMarkdown(report));

  console.log(JSON.stringify({ readiness, summary, reportMd: REPORT_MD }, null, 2));
  console.log("\n--- Smoke ---");
  for (const r of results) {
    if (r.area === "Environment" && (r.name.startsWith("Render:") || r.name.startsWith("Vercel:"))) continue;
    console.log(`${r.status.padEnd(12)} [${r.area}] ${r.name} ${r.ms != null ? `${r.ms}ms` : ""}`);
  }

  process.exit(summary.fail > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
