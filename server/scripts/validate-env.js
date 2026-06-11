#!/usr/bin/env node
/**
 * Validates required environment variables for CredXP API.
 * Phase 1: checks Mongo (current) + PostgreSQL contract + migration flags.
 * Does not start the server or touch business logic.
 */

require("dotenv").config();

const REQUIRED_ALWAYS = ["MONGODB_URI", "JWT_SECRET", "PORT"];

const REQUIRED_WHEN_PG_ENABLED = ["DATABASE_URL"];

const OPTIONAL_WITH_DEFAULTS = {
  NODE_ENV: "development",
  DB_PRIMARY: "mongo",
  DB_DUAL_WRITE: "false",
  PRISMA_LOG_QUERIES: "false",
  JWT_EXPIRES_IN: "7d",
};

const VALID_DB_PRIMARY = new Set(["mongo", "postgres"]);

function isSet(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

function fail(messages) {
  console.error("\n[validate-env] FAILED\n");
  messages.forEach((m) => console.error(`  - ${m}`));
  console.error("\nSee server/.env.example and docs/migration/ENV_CONTRACT.md\n");
  process.exit(1);
}

function warn(messages) {
  messages.forEach((m) => console.warn(`[validate-env] WARN: ${m}`));
}

const errors = [];
const warnings = [];

for (const key of REQUIRED_ALWAYS) {
  if (!isSet(key)) {
    errors.push(`Missing required variable: ${key}`);
  }
}

const dbPrimary = (process.env.DB_PRIMARY || OPTIONAL_WITH_DEFAULTS.DB_PRIMARY).toLowerCase();
if (!VALID_DB_PRIMARY.has(dbPrimary)) {
  errors.push(`DB_PRIMARY must be "mongo" or "postgres" (got: ${process.env.DB_PRIMARY})`);
}

const dualWrite = (process.env.DB_DUAL_WRITE || "false").toLowerCase();
if (!["true", "false"].includes(dualWrite)) {
  errors.push(`DB_DUAL_WRITE must be "true" or "false" (got: ${process.env.DB_DUAL_WRITE})`);
}

if (dbPrimary === "postgres" || dualWrite === "true") {
  for (const key of REQUIRED_WHEN_PG_ENABLED) {
    if (!isSet(key)) {
      errors.push(`Missing required variable for PostgreSQL path: ${key}`);
    }
  }
} else if (!isSet("DATABASE_URL")) {
  warnings.push(
    "DATABASE_URL is not set — OK for Phase 1 Mongo-only dev; required before Neon validation"
  );
}

if (isSet("DATABASE_URL") && !process.env.DATABASE_URL.startsWith("postgresql://")) {
  errors.push("DATABASE_URL must start with postgresql://");
}

if (isSet("JWT_SECRET") && process.env.JWT_SECRET.length < 16) {
  warnings.push("JWT_SECRET is shorter than 16 characters — use a long random value in production");
}

const cloudinaryKeys = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const cloudinarySet = cloudinaryKeys.filter(isSet);
if (cloudinarySet.length > 0 && cloudinarySet.length < cloudinaryKeys.length) {
  errors.push(
    `Cloudinary requires all of: ${cloudinaryKeys.join(", ")} (partially set: ${cloudinarySet.join(", ")})`
  );
} else if (cloudinarySet.length === 0) {
  warnings.push("Cloudinary env vars not set — required for image uploads (npm run validate:cloudinary)");
}

if (errors.length) {
  fail(errors);
}

warn(warnings);

console.log("[validate-env] OK");
console.log(`  NODE_ENV=${process.env.NODE_ENV || OPTIONAL_WITH_DEFAULTS.NODE_ENV}`);
console.log(`  DB_PRIMARY=${dbPrimary}`);
console.log(`  DB_DUAL_WRITE=${dualWrite}`);
console.log(`  DATABASE_URL=${isSet("DATABASE_URL") ? "(set)" : "(not set)"}`);
console.log(`  MONGODB_URI=${isSet("MONGODB_URI") ? "(set)" : "(missing)"}`);
