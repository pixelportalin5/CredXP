const prisma = require("../lib/prisma");
const { externalIdWhere, newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { findUser } = require("../lib/prisma/resolveEntity");
const { toApiAuditLog } = require("../lib/prisma/mappers");

const auditLogService = {
  async create({ actor, action, entityType, entityId, metadata = {} }) {
    const actorUser = actor?._id ? await findUser(actor._id) : null;

    const created = await prisma.auditLog.create({
      data: {
        id: newUuid(),
        legacyMongoId: newLegacyMongoId(),
        actorId: actorUser?.id || null,
        action,
        entityType,
        entityLegacyMongoId: entityId ? String(entityId) : null,
        metadata,
      },
      include: { actor: true },
    });

    return toApiAuditLog(created);
  },

  async list({ limit = 150 } = {}) {
    const rows = await prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(toApiAuditLog);
  },

  async getById(id) {
    const row = await prisma.auditLog.findFirst({
      where: externalIdWhere(id),
      include: { actor: true },
    });
    return toApiAuditLog(row);
  },

  async update(id, data) {
    const existing = await prisma.auditLog.findFirst({ where: externalIdWhere(id) });
    if (!existing) return null;

    const updated = await prisma.auditLog.update({
      where: { id: existing.id },
      data: {
        action: data.action ?? existing.action,
        metadata: data.metadata ?? existing.metadata,
      },
      include: { actor: true },
    });
    return toApiAuditLog(updated);
  },

  async delete(id) {
    const existing = await prisma.auditLog.findFirst({ where: externalIdWhere(id) });
    if (!existing) return null;
    await prisma.auditLog.delete({ where: { id: existing.id } });
    return { id: existing.legacyMongoId };
  },
};

module.exports = auditLogService;
