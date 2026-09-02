#!/usr/bin/env node
/**
 * Generates public/robots.txt.
 * Sitemap is served dynamically by src/app/sitemap.ts (do not duplicate here).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, "..");
const publicDir = path.join(clientRoot, "public");
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.credxp.com").replace(
  /\/$/,
  ""
);

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
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

console.log(`Wrote robots.txt`);
console.log(`Sitemap: ${SITE_URL}/sitemap.xml (served by src/app/sitemap.ts)`);
