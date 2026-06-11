const crypto = require("crypto");
const { Types } = require("mongoose");

function newLegacyMongoId() {
  return new Types.ObjectId().toString();
}

function newUuid() {
  return crypto.randomUUID();
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function externalIdWhere(id) {
  const value = String(id);
  if (isUuid(value)) {
    return { OR: [{ legacyMongoId: value }, { id: value }] };
  }
  return { legacyMongoId: value };
}

module.exports = {
  newLegacyMongoId,
  newUuid,
  externalIdWhere,
};
