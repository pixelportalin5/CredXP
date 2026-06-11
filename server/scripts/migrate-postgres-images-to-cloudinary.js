#!/usr/bin/env node
/**
 * Migrates remaining base64 images stored directly in PostgreSQL.
 * Complements migrate-images-to-cloudinary.js (MongoDB source).
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const prisma = require("../src/lib/prisma");
const imageUploadService = require("../src/services/imageUploadService");
const { requireCloudinaryEnv } = require("../src/config/cloudinary");

const DRY_RUN = process.argv.includes("--dry-run");
const REPORT_PATH = path.join(__dirname, "migrate-postgres-images-report.json");

const report = {
  startedAt: new Date().toISOString(),
  dryRun: DRY_RUN,
  migrated: 0,
  failed: 0,
  items: [],
  finishedAt: null,
};

function log(msg) {
  console.log(`[migrate-postgres-images] ${msg}`);
}

async function migrateValue(value, category) {
  if (!imageUploadService.isBase64DataUrl(value)) return null;
  if (DRY_RUN) return { imageUrl: `[dry-run]/${category}`, publicId: "[dry-run]" };
  return imageUploadService.uploadDataUrl(value, category);
}

async function fixProposals() {
  const rows = await prisma.proposal.findMany({
    select: { id: true, legacyMongoId: true, coverImage: true, agent: true },
  });

  for (const row of rows) {
    const updates = {};
    let changed = false;

    if (row.coverImage && imageUploadService.isBase64DataUrl(row.coverImage)) {
      const uploaded = await migrateValue(row.coverImage, "proposal");
      if (uploaded) {
        updates.coverImage = uploaded.imageUrl;
        updates.coverImagePublicId = uploaded.publicId;
        changed = true;
      }
    }

    const agent = row.agent && typeof row.agent === "object" ? { ...row.agent } : null;
    if (agent?.avatar && imageUploadService.isBase64DataUrl(agent.avatar)) {
      const uploaded = await migrateValue(agent.avatar, "avatar");
      if (uploaded) {
        agent.avatar = uploaded.imageUrl;
        agent.avatarPublicId = uploaded.publicId;
        updates.agent = agent;
        changed = true;
      }
    }

    if (!changed) continue;

    try {
      if (!DRY_RUN) {
        await prisma.proposal.update({ where: { id: row.id }, data: updates });
      }
      report.migrated += 1;
      report.items.push({ collection: "proposals", id: row.legacyMongoId, fields: Object.keys(updates) });
      log(`${DRY_RUN ? "[dry-run] would update" : "updated"} proposal ${row.legacyMongoId}`);
    } catch (error) {
      report.failed += 1;
      log(`FAILED proposal ${row.legacyMongoId}: ${error.message}`);
    }
  }
}

async function main() {
  if (!DRY_RUN) requireCloudinaryEnv();
  await prisma.$queryRaw`SELECT 1`;
  await fixProposals();
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  log(`migrated=${report.migrated} failed=${report.failed}`);
  await prisma.$disconnect();
  process.exit(report.failed > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
