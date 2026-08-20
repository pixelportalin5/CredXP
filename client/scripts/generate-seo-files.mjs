#!/usr/bin/env node
/**
 * Generates public/robots.txt and public/sitemap.xml from App Router pages.
 * Dynamic [param] routes are omitted here; client/src/app/sitemap.ts adds
 * live property and coworking URLs at request/build time.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, "..");
const appDir = path.join(clientRoot, "src", "app");
const publicDir = path.join(clientRoot, "public");
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.credxp.com").replace(
  /\/$/,
  ""
);

const PRIVATE_PREFIXES = [
  "/admin",
  "/employee",
  "/seller",
  "/user",
  "/login",
  "/register",
  "/export",
  "/proposals",
  "/list-property/bulk-upload",
];

const SKIP_ROUTES = new Set([
  "/properties",
  "/blog",
  "/market-reports",
  "/careers",
  "/support",
  "/partners",
  "/downloads",
]);

function walkPages(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkPages(full, acc);
    else if (entry.name === "page.tsx" || entry.name === "page.ts" || entry.name === "page.jsx") {
      acc.push(full);
    }
  }
  return acc;
}

function fileToRoute(filePath) {
  const rel = path.relative(appDir, path.dirname(filePath)).replace(/\\/g, "/");
  if (!rel || rel === ".") return "/";
  const route = `/${rel}`
    .replace(/\/\([^)]+\)/g, "")
    .replace(/\/+/g, "/");
  return route === "" ? "/" : route;
}

function isPrivate(route) {
  return PRIVATE_PREFIXES.some((prefix) => route === prefix || route.startsWith(`${prefix}/`));
}

function isDynamic(route) {
  return route.includes("[") || route.includes("]");
}

const routes = [
  ...new Set(
    walkPages(appDir)
      .map(fileToRoute)
      .filter((route) => !isPrivate(route) && !isDynamic(route) && !SKIP_ROUTES.has(route))
  ),
].sort((a, b) => {
  if (a === "/") return -1;
  if (b === "/") return 1;
  return a.localeCompare(b);
});

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    const loc = `${SITE_URL}${route === "/" ? "" : route}`;
    const priority = route === "/" ? "1.0" : route === "/invest" || route === "/lease" ? "0.9" : "0.7";
    const changefreq = route === "/" ? "daily" : "weekly";
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /employee/
Disallow: /seller/dashboard
Disallow: /user/
Disallow: /login
Disallow: /register
Disallow: /export/
Disallow: /properties/*/proposal
Disallow: /proposals/
Disallow: /list-property/bulk-upload

Sitemap: ${SITE_URL}/sitemap.xml
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

console.log(`Wrote ${routes.length} static routes to public/sitemap.xml`);
console.log(`Sitemap: ${SITE_URL}/sitemap.xml`);
