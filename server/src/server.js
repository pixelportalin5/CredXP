require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { isPostgres } = require("./lib/dbProvider");
const {
  getDatabaseUrlDiagnostic,
  assertPostgresDatabaseUrl,
  emitDebugLog,
} = require("./lib/databaseUrlDiagnostics");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbDiag = getDatabaseUrlDiagnostic();
  emitDebugLog("server.js:start", "DATABASE_URL diagnostic at boot", dbDiag, "H1-H5");

  if (isPostgres()) {
    try {
      assertPostgresDatabaseUrl();
      emitDebugLog("server.js:start", "Postgres DATABASE_URL validation PASS", dbDiag, "H1-H5");
    } catch (validationError) {
      emitDebugLog(
        "server.js:start",
        "Postgres DATABASE_URL validation FAIL",
        { ...dbDiag, error: validationError.message },
        "H1-H5"
      );
      console.error(`[startup] ${validationError.message}`);
      process.exit(1);
    }
  }

  await connectDB({ required: !isPostgres() });

  app.listen(PORT, () => {
    console.log(`\n🚀 CredXP Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}\n`);
    startZohoSchedule();
  });
};

/**
 * Optional periodic pull from Zoho (ZOHO_SYNC_INTERVAL_MINUTES, minimum 15).
 * A safety net for missed webhooks; off unless the variable is set.
 */
function startZohoSchedule() {
  const minutes = Number(process.env.ZOHO_SYNC_INTERVAL_MINUTES);
  if (!minutes) return;
  const { isConfigured } = require("./services/zohoCrmClient");
  if (!isConfigured()) {
    console.warn("[Zoho Import] ZOHO_SYNC_INTERVAL_MINUTES is set but the Zoho API is not configured; schedule off");
    return;
  }
  const { importAllFromZoho } = require("./services/zohoPropertySyncService");
  const run = () =>
    importAllFromZoho({ trigger: "schedule" }).catch((error) =>
      console.error(`[Zoho Import] scheduled run failed: ${error.message}`)
    );
  const intervalMs = Math.max(15, minutes) * 60 * 1000;
  setTimeout(run, 60 * 1000);
  setInterval(run, intervalMs).unref();
  console.log(`[Zoho Import] scheduled every ${Math.max(15, minutes)} minutes`);
}

startServer();
