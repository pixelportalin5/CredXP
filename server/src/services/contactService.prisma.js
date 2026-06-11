const prisma = require("../lib/prisma");
const { externalIdWhere } = require("../lib/prisma/legacyId");
const { toApiContactMessage, toPrismaContactCreate } = require("../lib/prisma/mappers");

const contactService = {
  async create(data) {
    const created = await prisma.contactMessage.create({
      data: toPrismaContactCreate(data),
    });
    return toApiContactMessage(created);
  },

  async list({ limit = 50 } = {}) {
    const rows = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(toApiContactMessage);
  },

  async getById(id) {
    const row = await prisma.contactMessage.findFirst({ where: externalIdWhere(id) });
    return toApiContactMessage(row);
  },

  async update(id, data) {
    const existing = await prisma.contactMessage.findFirst({ where: externalIdWhere(id) });
    if (!existing) return null;

    const updated = await prisma.contactMessage.update({
      where: { id: existing.id },
      data: {
        fullName: data.fullName ?? existing.fullName,
        email: data.email ? String(data.email).toLowerCase() : existing.email,
        phone: data.phone ?? existing.phone,
        company: data.company ?? existing.company,
        message: data.message ?? existing.message,
      },
    });
    return toApiContactMessage(updated);
  },

  async delete(id) {
    const existing = await prisma.contactMessage.findFirst({ where: externalIdWhere(id) });
    if (!existing) return null;
    await prisma.contactMessage.delete({ where: { id: existing.id } });
    return { id: existing.legacyMongoId };
  },
};

module.exports = contactService;
