const { getDbProvider } = require("./dbProvider");

function resolveService(loaders) {
  const provider = getDbProvider();
  const loader = provider === "postgres" ? loaders.prisma : loaders.mongo;
  if (typeof loader !== "function") {
    throw new Error(`No ${provider} loader registered for service`);
  }
  return loader();
}

module.exports = {
  resolveService,
};
