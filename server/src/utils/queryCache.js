const DEFAULT_TTL_MS = 3 * 60 * 1000;

const store = new Map();

function getCacheKey(prefix, params = {}) {
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

  return `${prefix}:${JSON.stringify(sorted)}`;
}

function getCached(key, ttlMs = DEFAULT_TTL_MS) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  store.set(key, { data, fetchedAt: Date.now() });
}

function invalidatePrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(`${prefix}:`)) {
      store.delete(key);
    }
  }
}

module.exports = {
  getCacheKey,
  getCached,
  setCached,
  invalidatePrefix,
};
