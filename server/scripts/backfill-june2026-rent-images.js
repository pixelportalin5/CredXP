#!/usr/bin/env node
/**
 * Backfill TempImages (3 per property) for June 2026 rent listings missing images.
 *
 * Usage:
 *   node scripts/backfill-june2026-rent-images.js --dry-run
 *   node scripts/backfill-june2026-rent-images.js
 *   node scripts/backfill-june2026-rent-images.js --force
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const prisma = require("../src/lib/prisma");
const { invalidatePrefix } = require("../src/utils/queryCache");
const {
  BUILDING_NAME_TO_THEME,
  themeForBuildingName,
  imagesForBuildingName,
} = require("../src/seed/data/june2026RentImageAssignments");

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");
const REPORT_PATH = path.join(__dirname, "backfill-june2026-rent-images-report.json");

const JUNE2026_BATCH_TAGS = ["june2026-rent-shops", "june2026-rent-offices"];

function log(message) {
  console.log(`[backfill-june2026-images] ${message}`);
}

function hasUsableImages(property) {
  const cover = property.coverImage ? String(property.coverImage).trim() : "";
  const coverId = property.coverImagePublicId ? String(property.coverImagePublicId).trim() : "";
  const images = Array.isArray(property.images)
    ? property.images.filter((img) => typeof img === "string" && img.trim())
    : [];

  if (coverId) return true;
  if (cover) return true;
  return images.length > 0;
}

function resolveTheme(property) {
  const buildingName = property.buildingName ? String(property.buildingName).trim() : "";
  if (buildingName && BUILDING_NAME_TO_THEME[buildingName]) {
    return { theme: themeForBuildingName(buildingName), matchedBy: "buildingName" };
  }

  const title = property.title ? String(property.title).trim() : "";
  for (const [name, theme] of Object.entries(BUILDING_NAME_TO_THEME)) {
    if (title.includes(name) || name.includes(title)) {
      return { theme, matchedBy: "title" };
    }
  }

  return null;
}

async function main() {
  const properties = await prisma.property.findMany({
    where: {
      isActive: true,
      listingStatus: "published",
      OR: JUNE2026_BATCH_TAGS.map((tag) => ({
        highlights: { has: tag },
      })),
    },
    select: {
      id: true,
      title: true,
      buildingName: true,
      type: true,
      images: true,
      coverImage: true,
      coverImagePublicId: true,
      imagePublicIds: true,
      highlights: true,
    },
    orderBy: { title: "asc" },
  });

  log(`Found ${properties.length} June 2026 rent properties`);

  const report = {
    startedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    force: FORCE,
    updated: [],
    skipped: [],
    failed: [],
    finishedAt: null,
  };

  for (const property of properties) {
    const match = resolveTheme(property);
    if (!match) {
      report.failed.push({
        id: property.id,
        title: property.title,
        buildingName: property.buildingName,
        reason: "No theme mapping found",
      });
      log(`FAIL  ${property.title} — no theme mapping`);
      continue;
    }

    if (!FORCE && hasUsableImages(property)) {
      report.skipped.push({
        id: property.id,
        title: property.title,
        buildingName: property.buildingName,
        reason: "Already has images (use --force to overwrite)",
      });
      log(`SKIP  ${property.title} — already has images`);
      continue;
    }

    let images;
    try {
      const buildingName =
        property.buildingName && BUILDING_NAME_TO_THEME[property.buildingName]
          ? property.buildingName
          : Object.keys(BUILDING_NAME_TO_THEME).find(
              (name) => property.title && property.title.includes(name.split(" — ")[0])
            );
      images = imagesForBuildingName(buildingName);
    } catch (err) {
      report.failed.push({
        id: property.id,
        title: property.title,
        buildingName: property.buildingName,
        reason: err.message,
      });
      log(`FAIL  ${property.title} — ${err.message}`);
      continue;
    }

    const updatePayload = {
      images,
      coverImage: images[0],
      coverImagePublicId: "",
      imagePublicIds: [],
    };

    if (DRY_RUN) {
      report.updated.push({
        id: property.id,
        title: property.title,
        buildingName: property.buildingName,
        theme: match.theme,
        matchedBy: match.matchedBy,
        images,
      });
      log(`DRY   ${property.title} → ${match.theme}`);
      continue;
    }

    await prisma.property.update({
      where: { id: property.id },
      data: updatePayload,
    });

    report.updated.push({
      id: property.id,
      title: property.title,
      buildingName: property.buildingName,
      theme: match.theme,
      matchedBy: match.matchedBy,
      images,
    });
    log(`OK    ${property.title} → ${match.theme}`);
  }

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  log("");
  log(`Updated: ${report.updated.length}`);
  log(`Skipped: ${report.skipped.length}`);
  log(`Failed:  ${report.failed.length}`);
  log(`Report:  ${REPORT_PATH}`);

  if (!DRY_RUN && report.updated.length > 0) {
    invalidatePrefix("properties:");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
