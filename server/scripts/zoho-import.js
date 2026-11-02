#!/usr/bin/env node
/**
 * Pull every property from Zoho CRM into the website database.
 * Usage (from server/):  npm run zoho:import
 * Needs the same env as the server: DB settings plus ZOHO_CLIENT_ID,
 * ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN (and optionally ZOHO_DC, ZOHO_PROPERTY_MODULE).
 */
require("dotenv").config();
const connectDB = require("../src/config/db");
const { isPostgres } = require("../src/lib/dbProvider");
const { importAllFromZoho } = require("../src/services/zohoPropertySyncService");

(async () => {
  try {
    await connectDB({ required: !isPostgres() });
    const summary = await importAllFromZoho({ trigger: "cli" });
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.failed.length ? 1 : 0);
  } catch (error) {
    console.error(`Zoho import failed: ${error.message}`);
    process.exit(1);
  }
})();
