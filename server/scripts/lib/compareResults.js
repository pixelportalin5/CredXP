function normalizeValue(value, seen = new WeakSet()) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value && typeof value.toHexString === "function") {
    return value.toHexString();
  }
  if (typeof value === "object" && value && value._bsontype === "ObjectID") {
    return String(value);
  }
  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    if (typeof value.toObject === "function") {
      return normalizeValue(value.toObject({ depopulate: true }), seen);
    }
    if (Array.isArray(value)) return value.map((item) => normalizeValue(item, seen));
    const sorted = {};
    Object.keys(value)
      .sort()
      .forEach((key) => {
        if (key.startsWith("$") || key === "__v") return;
        sorted[key] = normalizeValue(key === "_id" ? String(value[key]) : value[key], seen);
      });
    return sorted;
  }
  if (typeof value === "number" && Number.isNaN(value)) return null;
  return value;
}

function stableStringify(value) {
  return JSON.stringify(normalizeValue(value));
}

function compareResults(mongoResult, prismaResult) {
  const mongoNorm = stableStringify(mongoResult);
  const prismaNorm = stableStringify(prismaResult);
  return {
    match: mongoNorm === prismaNorm,
    mongoPreview: mongoNorm.slice(0, 500),
    prismaPreview: prismaNorm.slice(0, 500),
  };
}

module.exports = {
  normalizeValue,
  compareResults,
};
