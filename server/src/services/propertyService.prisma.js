const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { normalizePropertyListItem } = require("../utils/listPayload");
const { applyCoverImage } = require("../utils/imageThumbnail");
const { getCacheKey, getCached, setCached, invalidatePrefix } = require("../utils/queryCache");
const { buildPropertyWhere, buildPropertyOrderBy } = require("../lib/prisma/propertyQuery");
const { externalIdWhere, newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { findUser, findProperty } = require("../lib/prisma/resolveEntity");
const { toApiProperty, propertyDataToPrisma } = require("../lib/prisma/mappers");

/** List-view projection — card fields only; excludes coverImage blob (use coverImagePublicId). */
const PROPERTY_PRISMA_LIST_SELECT = {
  id: true,
  legacyMongoId: true,
  title: true,
  type: true,
  locationAddress: true,
  locationCity: true,
  locationState: true,
  locationPincode: true,
  locationMicromarket: true,
  locationLandmark: true,
  price: true,
  size: true,
  financialPrice: true,
  financialPriceUnit: true,
  financialRentalYield: true,
  specSize: true,
  specSizeUnit: true,
  specFurnishing: true,
  tenantName: true,
  tenantIndustry: true,
  status: true,
  grade: true,
  featured: true,
  views: true,
  enquiryCount: true,
  listingStatus: true,
  isActive: true,
  createdAt: true,
  coverImagePublicId: true,
};

function mapListProperty(row) {
  return normalizePropertyListItem(toApiProperty(row, { includeAll: false }));
}

async function paginateProperties(filters, page, limit, sort) {
  const where = buildPropertyWhere(filters);
  const skip = (Number(page) - 1) * Number(limit);
  const findArgs = {
    where,
    orderBy: buildPropertyOrderBy(sort),
    skip,
    take: Number(limit),
    select: PROPERTY_PRISMA_LIST_SELECT,
  };

  const [properties, total] = await Promise.all([
    prisma.property.findMany(findArgs),
    prisma.property.count({ where }),
  ]);

  return {
    properties: properties.map(mapListProperty),
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit),
    },
  };
}

const propertyService = {
  async getAll(params) {
    const { page = 1, limit = 10, sort, ...filters } = params;
    const cacheKey = getCacheKey("properties", { page, limit, sort, ...filters });
    const cached = getCached(cacheKey);
    if (cached) return cached;
    const result = await paginateProperties(filters, page, limit, sort);
    setCached(cacheKey, result);
    return result;
  },

  async getByStatus(status, limit = 6) {
    const properties = await prisma.property.findMany({
      where: buildPropertyWhere({ status }),
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      select: PROPERTY_PRISMA_LIST_SELECT,
    });
    return properties.map(mapListProperty);
  },

  async getById(id) {
    const property = await findProperty(id);
    if (property) {
      void prisma.property.update({ where: { id: property.id }, data: { views: { increment: 1 } } });
    }
    return property ? toApiProperty(property) : null;
  },

  async search(params) {
    const { page = 1, limit = 10, sort, q, ...filters } = params;
    const cacheKey = getCacheKey("properties-search", { q, sort, page, limit, ...filters });
    const cached = getCached(cacheKey);
    if (cached) return cached;
    const result = await paginateProperties({ ...filters, q }, page, limit, sort);
    setCached(cacheKey, result);
    return result;
  },

  async create(data, user) {
    const payload = await applyCoverImage({ ...data });
    let sellerUuid = null;

    if (user) {
      if (!["seller", "admin", "employee"].includes(user.role)) {
        throw new ApiError(403, "Seller access required");
      }
      if (!Array.isArray(payload.images) || payload.images.length !== 3) {
        throw new ApiError(400, "Seller-created listings require exactly 3 images");
      }
      const seller = await findUser(user._id);
      sellerUuid = seller?.id || null;
      payload.seller = user._id;
      payload.isActive = payload.isActive !== false;
      payload.listingStatus = payload.listingStatus || "published";
    }

    const created = await prisma.property.create({
      data: {
        id: newUuid(),
        legacyMongoId: newLegacyMongoId(),
        ...propertyDataToPrisma(payload, { sellerUuid }),
      },
    });

    invalidatePrefix("properties");
    return toApiProperty(created);
  },

  async getSellerProperties(sellerId) {
    const seller = await findUser(sellerId);
    if (!seller) return [];
    const rows = await prisma.property.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: "desc" },
      select: PROPERTY_PRISMA_LIST_SELECT,
    });
    return rows.map(mapListProperty);
  },

  async updateByOwner(id, data, user) {
    const property = await findProperty(id);
    if (!property) throw new ApiError(404, "Property not found");

    const actor = await findUser(user._id);
    const isOwner = property.sellerId && actor && property.sellerId === actor.id;
    if (!isOwner && !["admin", "employee"].includes(user.role)) {
      throw new ApiError(403, "You can only update your own listings");
    }

    if (property.sellerId && data.images && data.images.length !== 3) {
      throw new ApiError(400, "Seller-created listings require exactly 3 images");
    }

    const nextData = data.images ? await applyCoverImage(data) : data;
    const updated = await prisma.property.update({
      where: { id: property.id },
      data: propertyDataToPrisma({ ...toApiProperty(property), ...nextData }, { sellerUuid: property.sellerId }),
    });

    invalidatePrefix("properties");
    return toApiProperty(updated);
  },

  async deleteByOwner(id, user) {
    const property = await findProperty(id);
    if (!property) throw new ApiError(404, "Property not found");

    const actor = await findUser(user._id);
    const isOwner = property.sellerId && actor && property.sellerId === actor.id;
    if (!isOwner && !["admin", "employee"].includes(user.role)) {
      throw new ApiError(403, "You can only delete your own listings");
    }

    await prisma.enquiry.deleteMany({ where: { propertyId: property.id } });
    await prisma.property.delete({ where: { id: property.id } });
    invalidatePrefix("properties");
    return { id: property.legacyMongoId };
  },
};

module.exports = propertyService;
