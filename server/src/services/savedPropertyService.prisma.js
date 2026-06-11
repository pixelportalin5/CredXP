const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { externalIdWhere, newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { findUser, findProperty } = require("../lib/prisma/resolveEntity");
const { toApiProperty } = require("../lib/prisma/mappers");

const savedPropertyService = {
  async list(userId) {
    const user = await findUser(userId);
    if (!user) return [];

    const saved = await prisma.savedProperty.findMany({
      where: { userId: user.id },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });

    return saved.map((item) => toApiProperty(item.property)).filter(Boolean);
  },

  async save(userId, propertyId) {
    const user = await findUser(userId);
    const property = await findProperty(propertyId);
    if (!property) throw new ApiError(404, "Property not found");

    await prisma.savedProperty.upsert({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId: property.id,
        },
      },
      create: {
        id: newUuid(),
        legacyMongoId: newLegacyMongoId(),
        userId: user.id,
        propertyId: property.id,
      },
      update: {},
    });

    return toApiProperty(property);
  },

  async remove(userId, propertyId) {
    const user = await findUser(userId);
    const property = await findProperty(propertyId);
    if (!user || !property) return { propertyId };

    await prisma.savedProperty.deleteMany({
      where: { userId: user.id, propertyId: property.id },
    });
    return { propertyId: property.legacyMongoId };
  },

  async getById(id) {
    const row = await prisma.savedProperty.findFirst({
      where: externalIdWhere(id),
      include: { property: true, user: true },
    });
    if (!row) return null;
    return {
      _id: row.legacyMongoId,
      userId: row.user.legacyMongoId,
      propertyId: toApiProperty(row.property),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  async update(userId, propertyId) {
    const user = await findUser(userId);
    const property = await findProperty(propertyId);
    if (!user || !property) return null;
    const row = await prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId: property.id } },
    });
    return row ? { _id: row.legacyMongoId, userId: user.legacyMongoId, propertyId: property.legacyMongoId } : null;
  },

  async delete(userId, propertyId) {
    return this.remove(userId, propertyId);
  },
};

module.exports = savedPropertyService;
