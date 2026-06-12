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
  });
};

startServer();
