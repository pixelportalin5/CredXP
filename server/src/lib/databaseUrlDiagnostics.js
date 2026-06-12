/**
 * Safe DATABASE_URL diagnostics — never logs credentials or full URL.
 */

function getDatabaseUrlDiagnostic() {
  const raw = process.env.DATABASE_URL;
  const url = typeof raw === "string" ? raw : "";
  const trimmed = url.trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  const protocolMatch = unquoted.match(/^([a-z][a-z0-9+.-]*):/i);
  const protocol = protocolMatch ? protocolMatch[1].toLowerCase() : "none";

  return {
    isSet: url.length > 0,
    length: url.length,
    trimmedLength: trimmed.length,
    hasWrappingQuotes:
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")),
    protocol,
    isValidPostgres: protocol === "postgresql" || protocol === "postgres",
    dbProvider: process.env.DB_PROVIDER || "mongo",
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

function assertPostgresDatabaseUrl() {
  const diag = getDatabaseUrlDiagnostic();
  if (diag.dbProvider !== "postgres") return diag;

  if (!diag.isSet) {
    throw new Error(
      "DB_PROVIDER=postgres but DATABASE_URL is missing. Set Neon PostgreSQL URL on Render (postgresql://...)."
    );
  }
  if (!diag.isValidPostgres) {
    throw new Error(
      `DB_PROVIDER=postgres but DATABASE_URL protocol is "${diag.protocol}" (expected postgresql:// or postgres://). ` +
        "On Render: replace DATABASE_URL with your Neon pooled connection string — do not use MONGODB_URI."
    );
  }
  if (diag.hasWrappingQuotes) {
    throw new Error(
      "DATABASE_URL has wrapping quotes on Render. Paste the Neon URL without surrounding quote characters."
    );
  }
  return diag;
}

function emitDebugLog(location, message, data, hypothesisId) {
  // #region agent log
  fetch("http://127.0.0.1:7638/ingest/531824bf-0a14-482f-b510-6252707575d1", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "412ec5" },
    body: JSON.stringify({
      sessionId: "412ec5",
      location,
      message,
      data,
      hypothesisId,
      timestamp: Date.now(),
      runId: process.env.DEBUG_RUN_ID || "startup",
    }),
  }).catch(() => {});
  // #endregion
}

module.exports = {
  getDatabaseUrlDiagnostic,
  assertPostgresDatabaseUrl,
  emitDebugLog,
};
