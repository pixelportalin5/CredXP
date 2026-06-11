const VALID_PROVIDERS = new Set(["mongo", "postgres"]);

function getDbProvider() {
  const value = String(process.env.DB_PROVIDER || "mongo").toLowerCase();
  return VALID_PROVIDERS.has(value) ? value : "mongo";
}

function isPostgres() {
  return getDbProvider() === "postgres";
}

function isMongo() {
  return getDbProvider() === "mongo";
}

module.exports = {
  VALID_PROVIDERS,
  getDbProvider,
  isPostgres,
  isMongo,
};
