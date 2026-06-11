const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { normalizeCoworkingListItem } = require("../utils/listPayload");
const { applyCoverImage } = require("../utils/imageThumbnail");
const { getCacheKey, getCached, setCached, invalidatePrefix } = require("../utils/queryCache");
const { externalIdWhere, newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { findUser, findCoworkingSpace } = require("../lib/prisma/resolveEntity");
const { toApiCoworking, coworkingDataToPrisma } = require("../lib/prisma/mappers");

function buildSort(sort) {
  const map = {
    newest: { createdAt: "desc" },
    featured: [{ featured: "desc" }, { createdAt: "desc" }],
    price_asc: { monthlySeatPrice: "asc" },
    price_desc: { monthlySeatPrice: "desc" },
  };
  return map[sort] || [{ featured: "desc" }, { createdAt: "desc" }];
}

function buildWhere(filters = {}) {
  const { city, operator, minPrice, maxPrice, minSeats, q, includeInactive = false } = filters;
  const where = includeInactive
    ? {}
    : { isActive: true, listingStatus: "published" };

  if (city) where.locationCity = { contains: city, mode: "insensitive" };
  if (operator) where.operator = { contains: operator, mode: "insensitive" };
  if (minPrice || maxPrice) {
    where.monthlySeatPrice = {};
    if (minPrice) where.monthlySeatPrice.gte = Number(minPrice);
    if (maxPrice) where.monthlySeatPrice.lte = Number(maxPrice);
  }
  if (minSeats) where.specSeatsFrom = { gte: Number(minSeats) };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { operator: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { locationCity: { contains: q, mode: "insensitive" } },
      { locationMicromarket: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

const coworkingService = {
  async getAll(params = {}) {
    const { page = 1, limit = 20, sort, ...filters } = params;
    const cacheKey = getCacheKey("coworking", { page, limit, sort, ...filters });
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const where = buildWhere(filters);
    const skip = (Number(page) - 1) * Number(limit);
    const [spaces, total] = await Promise.all([
      prisma.coworkingSpace.findMany({
        where,
        orderBy: buildSort(sort),
        skip,
        take: Number(limit),
      }),
      prisma.coworkingSpace.count({ where }),
    ]);

    const result = {
      spaces: spaces.map((space) => normalizeCoworkingListItem(toApiCoworking(space))),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1,
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    };

    setCached(cacheKey, result);
    return result;
  },

  async listForAdmin(params = {}) {
    const rows = await prisma.coworkingSpace.findMany({
      where: buildWhere({ ...params, includeInactive: true }),
      include: { seller: true },
      orderBy: { createdAt: "desc" },
      take: 150,
    });
    return rows.map((row) => ({
      ...toApiCoworking(row),
      seller: row.seller ? { _id: row.seller.legacyMongoId, name: row.seller.name, email: row.seller.email, role: row.seller.role } : undefined,
      images: undefined,
    }));
  },

  async getSellerSpaces(sellerId) {
    const seller = await findUser(sellerId);
    if (!seller) return [];
    const rows = await prisma.coworkingSpace.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => {
      const api = toApiCoworking(row);
      delete api.images;
      return api;
    });
  },

  async getById(id) {
    const space = await findCoworkingSpace(id);
    if (space) {
      void prisma.coworkingSpace.update({
        where: { id: space.id },
        data: { views: { increment: 1 } },
      });
    }
    return space ? toApiCoworking(space) : null;
  },

  async create(data, sellerId) {
    const seller = sellerId ? await findUser(sellerId) : null;
    const payload = await applyCoverImage({
      ...data,
      seller: seller?.legacyMongoId || data.seller,
      isActive: data.isActive !== false,
      listingStatus: data.listingStatus || "published",
    });

    const created = await prisma.coworkingSpace.create({
      data: {
        id: newUuid(),
        legacyMongoId: newLegacyMongoId(),
        ...coworkingDataToPrisma(payload, { sellerUuid: seller?.id }),
      },
    });

    invalidatePrefix("coworking");
    return toApiCoworking(created);
  },

  async updateById(id, data, user) {
    const space = await findCoworkingSpace(id);
    if (!space) throw new ApiError(404, "Coworking space not found");

    const actor = await findUser(user._id);
    const isOwner = space.sellerId && actor && space.sellerId === actor.id;
    if (!isOwner && !["admin", "employee"].includes(user.role)) {
      throw new ApiError(403, "You can only update your own coworking spaces");
    }

    const nextData = data.images ? await applyCoverImage(data) : data;
    const updated = await prisma.coworkingSpace.update({
      where: { id: space.id },
      data: coworkingDataToPrisma({ ...toApiCoworking(space), ...nextData }, { sellerUuid: space.sellerId }),
    });

    invalidatePrefix("coworking");
    return toApiCoworking(updated);
  },

  async deleteById(id, user) {
    const space = await findCoworkingSpace(id);
    if (!space) throw new ApiError(404, "Coworking space not found");

    const actor = await findUser(user._id);
    const isOwner = space.sellerId && actor && space.sellerId === actor.id;
    if (!isOwner && !["admin", "employee"].includes(user.role)) {
      throw new ApiError(403, "You can only delete your own coworking spaces");
    }

    await prisma.coworkingSpace.delete({ where: { id: space.id } });
    invalidatePrefix("coworking");
    return { id: space.legacyMongoId };
  },
};

module.exports = coworkingService;
