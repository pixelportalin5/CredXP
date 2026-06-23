#!/usr/bin/env node
/**
 * CredXP SEO validation — checks deployed pages for metadata, headings, and infra.
 *
 * Usage:
 *   node server/scripts/validate-seo.js
 *   APP_URL=https://www.credxp.com API_URL=https://credxp-backend-no10.onrender.com/api node server/scripts/validate-seo.js
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const APP_URL = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.credxp.com").replace(/\/$/, "");
const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const REPORT_JSON = path.join(__dirname, "validate-seo-report.json");

const STATIC_ROUTES = [
  "/",
  "/invest",
  "/lease",
  "/coworking",
  "/insights",
  "/about",
  "/contact",
  "/compare",
  "/privacy",
  "/terms",
  "/blog",
  "/market-reports",
  "/downloads",
  "/login",
  "/register",
  "/admin/dashboard",
  "/sitemap.xml",
  "/robots.txt",
  "/og-image.jpg",
  "/icon.png",
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.get(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        timeout: 30000,
        headers: { "User-Agent": "CredXP-SEO-Audit/1.0", Accept: "text/html,*/*" },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 0, headers: res.headers, body }));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error(`timeout: ${url}`)));
  });
}

function extractMeta(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${key}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }
  return "";
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}

function countH1(html) {
  return (html.match(/<h1[\s>]/gi) || []).length;
}

function hasCanonical(html) {
  return /<link[^>]+rel=["']canonical["']/i.test(html);
}

function hasJsonLd(html) {
  return /application\/ld\+json/i.test(html);
}

function checkPage(route, html, status) {
  const title = extractTitle(html);
  const description = extractMeta(html, "description");
  const ogTitle = extractMeta(html, "og:title");
  const ogImage = extractMeta(html, "og:image");
  const robots = extractMeta(html, "robots");
  const h1Count = countH1(html);
  const issues = [];

  if (status !== 200) issues.push(`HTTP ${status}`);
  if (!title) issues.push("Missing <title>");
  if (title.length > 65) issues.push(`Title long (${title.length} chars)`);
  if (!description) issues.push("Missing meta description");
  if (description.length > 165) issues.push(`Description long (${description.length} chars)`);
  if (route === "/" && h1Count !== 1) issues.push(`Expected 1 H1 on homepage, found ${h1Count}`);
  if (route === "/" && !ogImage) issues.push("Missing og:image on homepage");
  if (route === "/" && !hasJsonLd(html)) issues.push("Missing JSON-LD on homepage");
  if (["/invest", "/lease", "/about", "/contact"].includes(route) && !hasCanonical(html)) {
    issues.push("Missing canonical link");
  }
  if (route.startsWith("/admin") && !/noindex/i.test(robots)) issues.push("Admin route should be noindex");
  if (["/blog", "/market-reports", "/downloads"].includes(route) && !/noindex/i.test(robots)) {
    issues.push("Thin placeholder page should be noindex");
  }
  if (["/login", "/register"].includes(route) && !/noindex/i.test(robots)) {
    issues.push("Auth page should be noindex");
  }

  return {
    route,
    status,
    title,
    description,
    ogTitle,
    ogImage,
    h1Count,
    robots,
    issues,
    pass: issues.length === 0,
  };
}

async function sampleDynamicRoutes() {
  if (!API_URL) return [];
  try {
    const [propsRes, coworkRes] = await Promise.all([
      fetchText(`${API_URL}/properties?limit=3&page=1`),
      fetchText(`${API_URL}/coworking?limit=2`),
    ]);
    const propsJson = JSON.parse(propsRes.body);
    const coworkJson = JSON.parse(coworkRes.body);
    const propertyIds = (propsJson?.data?.properties || []).map((p) => p._id).slice(0, 3);
    const coworkIds = (coworkJson?.data || []).map((c) => c._id).slice(0, 2);
    return [
      ...propertyIds.map((id) => `/properties/${id}`),
      ...coworkIds.map((id) => `/coworking/${id}`),
    ];
  } catch {
    return [];
  }
}

async function main() {
  const routes = [...STATIC_ROUTES, ...(await sampleDynamicRoutes())];
  const results = [];

  for (const route of routes) {
    const url = `${APP_URL}${route}`;
    try {
      const res = await fetchText(url);
      const page = checkPage(route, res.body, res.status);
      results.push(page);
      console.log(page.pass ? "PASS" : "FAIL", route, page.issues.join("; ") || "");
    } catch (error) {
      results.push({ route, pass: false, issues: [error.message] });
      console.log("FAIL", route, error.message);
    }
  }

  const passed = results.filter((r) => r.pass).length;
  const report = {
    auditedAt: new Date().toISOString(),
    appUrl: APP_URL,
    apiUrl: API_URL || null,
    score: results.length ? Math.round((passed / results.length) * 100) : 0,
    passed,
    total: results.length,
    results,
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
  console.log(`\nSEO score: ${report.score}/100 (${passed}/${results.length}) → ${REPORT_JSON}`);
  process.exit(report.score >= 70 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
