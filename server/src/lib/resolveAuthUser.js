const User = require("../models/User");
const { isPostgres } = require("./dbProvider");
const { findUser } = require("./prisma/resolveEntity");
const { toApiUser } = require("./prisma/mappers");

async function resolveAuthUser(id) {
  if (!id) return null;

  if (isPostgres()) {
    const record = await findUser(id);
    if (!record) return null;
    const api = toApiUser(record);
    return {
      _id: api._id,
      id: record.id,
      name: api.name,
      email: api.email,
      phone: api.phone,
      role: api.role,
      accountStatus: api.accountStatus || "active",
      createdAt: api.createdAt,
      updatedAt: api.updatedAt,
    };
  }

  return User.findById(id);
}

module.exports = {
  resolveAuthUser,
};
