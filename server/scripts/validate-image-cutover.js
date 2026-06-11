#!/usr/bin/env node
/**
 * Phase 5B — Final image cutover validation (PostgreSQL + HTTP list/detail).
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
process.env.DB_PROVIDER = "postgres";

const prisma = require("../src/lib/prisma");
const { isBase64DataUrl } = require("../src/utils/listPayload");

const PORT = Number(process.env.PORT || 5000);
const HOST = "127.0.0.1";
const REPORT_JSON = path.join(__dirname, "validate-image-cutover-report.json");
const REPORT_MD = path.join(__dirname, "..", "..", "docs", "migration", "PHASE5B_IMAGE_CUTOVER_REPORT.md");

function analyzeString(value) {
  if (!value || typeof value !== "string") return { empty: true, base64: false, cloudinary: false };
  return {
    empty: value.length === 0,
    base64: isBase64DataUrl(value),
    cloudinary: value.includes("res.cloudinary.com/"),
  };
}

function summarizePostgres(rows, options = {}) {
  const stats = {
    total: rows.length,
    coverBase64: 0,
    coverCloudinary: 0,
    coverEmpty: 0,
    coverPublicId: 0,
    imagesBase64: 0,
    imagesCloudinary: 0,
    avatarBase64: 0,
    avatarCloudinary: 0,
  };

  for (const row of rows) {
    if (options.coverKey) {
      const cover = analyzeString(row[options.coverKey]);
      if (cover.base64) stats.coverBase64 += 1;
      else if (cover.cloudinary) stats.coverCloudinary += 1;
      else if (cover.empty) stats.coverEmpty += 1;
    }
    const publicId = row.coverImagePublicId || row.avatarPublicId;
    if (publicId && String(publicId).trim()) stats.coverPublicId += 1;

    if (Array.isArray(row.images)) {
      for (const img of row.images) {
        if (isBase64DataUrl(img)) stats.imagesBase64 += 1;
        else if (typeof img === "string" && img.includes("res.cloudinary.com/")) stats.imagesCloudinary += 1;
      }
    }

    if (options.avatarKey) {
      const avatar = analyzeString(row[options.avatarKey]);
      if (avatar.base64) stats.avatarBase64 += 1;
      else if (avatar.cloudinary) stats.avatarCloudinary += 1;
    }

    if (row.agent && typeof row.agent === "object") {
      const agentAvatar = analyzeString(row.agent.avatar);
      if (agentAvatar.base64) stats.agentAvatarBase64 = (stats.agentAvatarBase64 || 0) + 1;
      else if (agentAvatar.cloudinary) stats.agentAvatarCloudinary = (stats.agentAvatarCloudinary || 0) + 1;
    }
  }

  return stats;
}

function httpGet(urlPath) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.get({ hostname: HOST, port: PORT, path: urlPath, timeout: 30000 }, (res) => {
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
          hasBase64: raw.includes("data:image/"),
          json,
        });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function main() {
  await prisma.$queryRaw`SELECT 1`;

  const [properties, coworking, users, proposals] = await Promise.all([
    prisma.property.findMany({
      select: { legacyMongoId: true, coverImage: true, coverImagePublicId: true, images: true },
    }),
    prisma.coworkingSpace.findMany({
      select: { legacyMongoId: true, coverImage: true, coverImagePublicId: true, images: true },
    }),
    prisma.user.findMany({ select: { legacyMongoId: true, avatar: true, avatarPublicId: true } }),
    prisma.proposal.findMany({
      select: { legacyMongoId: true, coverImage: true, coverImagePublicId: true, agent: true },
    }),
  ]);

  const inventory = {
    properties: summarizePostgres(properties, { coverKey: "coverImage" }),
    coworking: summarizePostgres(coworking, { coverKey: "coverImage" }),
    users: summarizePostgres(users, { avatarKey: "avatar" }),
    proposals: summarizePostgres(proposals, { coverKey: "coverImage" }),
  };

  const remainingBase64 =
    inventory.properties.coverBase64 +
    inventory.properties.imagesBase64 +
    inventory.coworking.coverBase64 +
    inventory.coworking.imagesBase64 +
    inventory.users.avatarBase64 +
    inventory.proposals.coverBase64 +
    (inventory.proposals.agentAvatarBase64 || 0);

  let listCheck = { status: "SKIP", reason: "Server not running" };
  let detailCheck = { status: "SKIP", reason: "Server not running" };
  let thumbnailCount = 0;
  let cloudinaryThumbnailCount = 0;

  try {
    const list = await httpGet("/api/properties?page=1&limit=20&sort=newest&category=investment");
    const items = list.json?.data?.properties || [];
    thumbnailCount = items.length;
    cloudinaryThumbnailCount = items.filter(
      (p) =>
        typeof p.coverImage === "string" &&
        (p.coverImage.includes("res.cloudinary.com/") || p.coverImagePublicId)
    ).length;

    listCheck = {
      status: list.status === 200 && !list.hasBase64 ? "PASS" : "FAIL",
      sizeKb: list.sizeKb,
      hasBase64: list.hasBase64,
      propertyCount: items.length,
      cloudinaryThumbnails: cloudinaryThumbnailCount,
    };

    const firstId = items[0]?._id;
    if (firstId) {
      const detail = await httpGet(`/api/properties/${firstId}`);
      const detailImages = detail.json?.data?.images || [];
      const detailHasCloudinary =
        detail.json?.data?.coverImage?.includes("res.cloudinary.com/") ||
        detailImages.some((img) => typeof img === "string" && img.includes("res.cloudinary.com/"));
      detailCheck = {
        status:
          detail.status === 200 && detailHasCloudinary && !detail.hasBase64 ? "PASS" : "FAIL",
        propertyId: firstId,
        sizeKb: detail.sizeKb,
        hasBase64: detail.hasBase64,
        hasCloudinary: detailHasCloudinary,
        imageCount: detailImages.length,
      };
    }
  } catch {
    /* server offline */
  }

  let migrateReport = null;
  const migratePath = path.join(__dirname, "migrate-images-report.json");
  if (fs.existsSync(migratePath)) {
    migrateReport = JSON.parse(fs.readFileSync(migratePath, "utf8"));
  }

  let syncReport = null;
  const syncPath = path.join(__dirname, "sync-images-mongo-report.json");
  if (fs.existsSync(syncPath)) {
    syncReport = JSON.parse(fs.readFileSync(syncPath, "utf8"));
  }

  const remainingBlockers = [];
  if (remainingBase64 > 0) remainingBlockers.push(`${remainingBase64} base64 image field(s) remain in PostgreSQL`);

  const cloudinaryWithoutPublicId =
    inventory.properties.coverCloudinary - inventory.properties.coverPublicId;
  if (cloudinaryWithoutPublicId > 0) {
    remainingBlockers.push(
      `${cloudinaryWithoutPublicId} Cloudinary covers missing coverImagePublicId (list thumbnails may fail)`
    );
  }
  if (listCheck.status === "FAIL") remainingBlockers.push("Property list still serves base64 or HTTP error");
  if (detailCheck.status === "FAIL") remainingBlockers.push("Property detail page images not fully on Cloudinary");
  if (cloudinaryThumbnailCount === 0 && thumbnailCount > 0) {
    remainingBlockers.push("Property cards have no Cloudinary thumbnails in list API");
  }

  const report = {
    phase: "5B-image-cutover",
    completedAt: new Date().toISOString(),
    dbProvider: "postgres",
    migration: migrateReport
      ? {
          dryRun: migrateReport.dryRun,
          migrated: migrateReport.totals?.migrated ?? 0,
          failed: migrateReport.totals?.failed ?? 0,
          skipped: migrateReport.totals?.skipped ?? 0,
          collections: migrateReport.collections,
        }
      : null,
    postgresSync: syncReport
      ? {
          synced: syncReport.totals?.synced ?? 0,
          failed: syncReport.totals?.failed ?? 0,
          missing: syncReport.totals?.missing ?? 0,
        }
      : null,
    postgresInventory: inventory,
    remainingBase64,
    http: { list: listCheck, detail: detailCheck },
    remainingBlockers,
  };

  const md = [
    "# Phase 5B Image Cutover Report",
    "",
    `**Generated:** ${report.completedAt}`,
    "",
    "## Migration (MongoDB → Cloudinary)",
    "",
    migrateReport
      ? `- Migrated: **${migrateReport.totals.migrated}** | Failed: **${migrateReport.totals.failed}** | Skipped: **${migrateReport.totals.skipped}**`
      : "- No migrate-images-report.json found",
    "",
    "## PostgreSQL Sync",
    "",
    syncReport
      ? `- Synced: **${syncReport.totals.synced}** | Failed: **${syncReport.totals.failed}** | Missing: **${syncReport.totals.missing}**`
      : "- No sync report found",
    "",
    "## PostgreSQL Inventory",
    "",
    "| Collection | Total | Cover base64 | Gallery base64 | coverImagePublicId |",
    "|------------|-------|--------------|----------------|--------------------|",
    `| Properties | ${inventory.properties.total} | ${inventory.properties.coverBase64} | ${inventory.properties.imagesBase64} | ${inventory.properties.coverPublicId}/${inventory.properties.total} |`,
    `| Coworking | ${inventory.coworking.total} | ${inventory.coworking.coverBase64} | ${inventory.coworking.imagesBase64} | ${inventory.coworking.coverPublicId}/${inventory.coworking.total} |`,
    `| Users | ${inventory.users.total} | — | — | avatars cloudinary: ${inventory.users.avatarCloudinary} |`,
    `| Proposals | ${inventory.proposals.total} | ${inventory.proposals.coverBase64} | — | ${inventory.proposals.coverPublicId}/${inventory.proposals.total} |`,
    "",
    `**Remaining base64 fields:** ${remainingBase64}`,
    "",
    "## HTTP Verification",
    "",
    `- List API: **${listCheck.status}** (${cloudinaryThumbnailCount}/${thumbnailCount} Cloudinary thumbnails, base64=${listCheck.hasBase64 ?? "n/a"})`,
    `- Detail API: **${detailCheck.status}** (property ${detailCheck.propertyId || "n/a"})`,
    "",
  ];

  if (remainingBlockers.length) {
    md.push("## Remaining Blockers", "");
    for (const b of remainingBlockers) md.push(`- ${b}`);
  } else {
    md.push("## Status", "", "**Image cutover complete — no remaining blockers.**");
  }

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
  fs.mkdirSync(path.dirname(REPORT_MD), { recursive: true });
  fs.writeFileSync(REPORT_MD, md.join("\n"));

  console.log(JSON.stringify(report, null, 2));
  console.log(`\nReport: ${REPORT_MD}`);

  await prisma.$disconnect();
  process.exit(remainingBlockers.length > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
