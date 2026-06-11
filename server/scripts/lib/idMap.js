const { randomUUID } = require("crypto");

/**
 * Maps MongoDB ObjectId strings to new PostgreSQL UUIDs.
 * Stable within a single migration run; persisted rows use legacy_mongo_id for re-runs.
 */
class IdMap {
  constructor(name) {
    this.name = name;
    this.mongoToUuid = new Map();
    this.uuidToMongo = new Map();
  }

  assign(mongoId) {
    const key = String(mongoId);
    if (!this.mongoToUuid.has(key)) {
      const uuid = randomUUID();
      this.mongoToUuid.set(key, uuid);
      this.uuidToMongo.set(uuid, key);
    }
    return this.mongoToUuid.get(key);
  }

  get(mongoId) {
    if (!mongoId) return null;
    return this.mongoToUuid.get(String(mongoId)) || null;
  }

  has(mongoId) {
    return this.mongoToUuid.has(String(mongoId));
  }

  size() {
    return this.mongoToUuid.size;
  }
}

module.exports = {
  IdMap,
};
