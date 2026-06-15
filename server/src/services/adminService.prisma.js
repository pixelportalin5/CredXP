const prisma = require("../lib/prisma");
const auditLogService = require("./auditLogService");
const coworkingService = require("./coworkingService");
const propertyService = require("./propertyService");
const { applyCoverImage } = require("../utils/imageThumbnail");
const { invalidatePrefix } = require("../utils/queryCache");
const ApiError = require("../utils/ApiError");
const { findUser, findEnquiry } = require("../lib/prisma/resolveEntity");
const { toApiUser, toApiProperty, toApiEnquiry } = require("../lib/prisma/mappers");
const { normalizePropertyListItem } = require("../utils/listPayload");

/** Admin list projection — excludes coverImage/images blobs; matches public list optimization. */
const ADMIN_PROPERTY_PRISMA_LIST_SELECT = {
  id: true,
  legacyMongoId: true,
  sellerId: true,
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
  buildingName: true,
  createdAt: true,
  coverImage: true,
  coverImagePublicId: true,
  seller: {
    select: { legacyMongoId: true, name: true, email: true, role: true },
  },
};

function mapAdminListProperty(row) {
  const { seller, ...propertyRow } = row;
  const api = normalizePropertyListItem(toApiProperty(propertyRow, { includeAll: false }));
  if (seller) {
    api.seller = {
      _id: seller.legacyMongoId,
      name: seller.name,
      email: seller.email,
      role: seller.role,
    };
  }
  return api;
}

function publicUser(user) {
  return toApiUser(user);
}

async function writeLog(actor, action, entityType, entityId, metadata = {}) {
  return auditLogService.create({ actor, action, entityType, entityId, metadata });
}

function compactUser(row) {
  if (!row) return null;
  return {
    _id: row.legacyMongoId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
  };
}

const propertySelect = {
  title: true,
  type: true,
  locationAddress: true,
  locationCity: true,
  locationState: true,
  price: true,
  legacyMongoId: true,
};

const coworkingSelect = {
  title: true,
  operator: true,
  locationAddress: true,
  locationCity: true,
  locationState: true,
  monthlySeatPrice: true,
  priceLabel: true,
  legacyMongoId: true,
};

function mapAdminEnquiry(row) {
  const base = toApiEnquiry(row);
  return {
    ...base,
    propertyId: row.property
      ? {
          _id: row.property.legacyMongoId,
          title: row.property.title,
          type: row.property.type,
          location: {
            address: row.property.locationAddress,
            city: row.property.locationCity,
            state: row.property.locationState,
          },
          price: row.property.price,
        }
      : null,
    coworkingSpaceId: row.coworkingSpace
      ? {
          _id: row.coworkingSpace.legacyMongoId,
          title: row.coworkingSpace.title,
          operator: row.coworkingSpace.operator,
          location: {
            address: row.coworkingSpace.locationAddress,
            city: row.coworkingSpace.locationCity,
            state: row.coworkingSpace.locationState,
          },
          monthlySeatPrice: row.coworkingSpace.monthlySeatPrice,
          priceLabel: row.coworkingSpace.priceLabel,
        }
      : null,
    sellerId: compactUser(row.seller),
    userId: compactUser(row.user),
  };
}

const adminService = {
  async summary() {
    const [
      totalUsers,
      activeSellers,
      openEnquiries,
      closedEnquiries,
      savedPropertyCount,
      activeListings,
      missingImages,
      missingReraId,
      missingTenant,
      missingFinancials,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "seller", accountStatus: { not: "disabled" } } }),
      prisma.enquiry.count({ where: { status: { not: "closed" } } }),
      prisma.enquiry.count({ where: { status: "closed" } }),
      prisma.savedProperty.count(),
      prisma.property.count({ where: { isActive: true, listingStatus: "published" } }),
      prisma.property.count({ where: { images: { equals: [] } } }),
      prisma.property.count({ where: { OR: [{ reraId: null }, { reraId: "" }] } }),
      prisma.property.count({ where: { OR: [{ tenantName: null }, { tenantName: "" }] } }),
      prisma.property.count({
        where: { OR: [{ financialRentalYield: null }, { financialCapRate: null }] },
      }),
    ]);

    return {
      metrics: {
        totalUsers,
        activeSellers,
        activeListings,
        openEnquiries,
        closedEnquiries,
        savedPropertyCount,
      },
      dataQuality: {
        missingImages,
        missingReraId,
        missingTenant,
        missingFinancials,
      },
    };
  },

  async listUsers({ q, role, accountStatus } = {}) {
    const where = {};
    if (role) where.role = role;
    if (accountStatus) where.accountStatus = accountStatus;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
    return users.map(publicUser);
  },

  async updateUser(actor, id, data) {
    if (actor.role === "employee" && (data.role !== undefined || data.accountStatus !== undefined)) {
      throw new ApiError(403, "Only admins can change roles or account status");
    }

    const allowed = {};
    if (data.name !== undefined) allowed.name = data.name;
    if (data.phone !== undefined) allowed.phone = data.phone;
    if (data.role !== undefined) {
      if (!["buyer", "seller", "admin", "employee"].includes(data.role)) {
        throw new ApiError(400, "Invalid role");
      }
      allowed.role = data.role;
    }
    if (data.accountStatus !== undefined) {
      if (!["active", "disabled"].includes(data.accountStatus)) {
        throw new ApiError(400, "Invalid account status");
      }
      allowed.accountStatus = data.accountStatus;
    }

    const user = await findUser(id);
    if (!user) throw new ApiError(404, "User not found");

    const updated = await prisma.user.update({ where: { id: user.id }, data: allowed });
    await writeLog(actor, "admin.user.update", "User", updated.legacyMongoId, allowed);
    return publicUser(updated);
  },

  async listEnquiries({ status, q } = {}) {
    const where = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.enquiry.findMany({
      where,
      include: {
        property: { select: propertySelect },
        coworkingSpace: { select: coworkingSelect },
        seller: { select: { legacyMongoId: true, name: true, email: true, phone: true, role: true } },
        user: { select: { legacyMongoId: true, name: true, email: true, phone: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 150,
    });

    return rows.map(mapAdminEnquiry);
  },

  async updateEnquiryStatus(actor, id, status) {
    if (!["open", "closed"].includes(status)) {
      throw new ApiError(400, "Invalid enquiry status");
    }

    const enquiry = await findEnquiry(id);
    if (!enquiry) throw new ApiError(404, "Enquiry not found");

    const updated = await prisma.enquiry.update({
      where: { id: enquiry.id },
      data:
        status === "closed"
          ? { status, closedAt: new Date() }
          : { status, closedAt: null },
      include: {
        property: { select: propertySelect },
        coworkingSpace: { select: coworkingSelect },
        seller: { select: { legacyMongoId: true, name: true, email: true, phone: true, role: true } },
        user: { select: { legacyMongoId: true, name: true, email: true, phone: true, role: true } },
      },
    });

    await writeLog(actor, "admin.enquiry.status", "Enquiry", updated.legacyMongoId, { status });
    return mapAdminEnquiry(updated);
  },

  async listLogs() {
    return auditLogService.list({ limit: 150 });
  },

  async listProperties({ q, listingStatus } = {}) {
    const where = {};
    if (listingStatus) where.listingStatus = listingStatus;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { buildingName: { contains: q, mode: "insensitive" } },
        { locationCity: { contains: q, mode: "insensitive" } },
        { tenantName: { contains: q, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.property.findMany({
      where,
      select: ADMIN_PROPERTY_PRISMA_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: 150,
    });

    return rows.map(mapAdminListProperty);
  },

  async createProperty(actor, data) {
    const property = await propertyService.create(
      {
        ...data,
        seller: undefined,
        isActive: data.isActive !== false,
        listingStatus: data.listingStatus || "published",
      },
      null
    );
    await writeLog(actor, "admin.property.create", "Property", property._id, { title: property.title });
    return property;
  },

  async updateProperty(actor, id, data) {
    const property = await propertyService.updateByOwner(id, data, actor);
    await writeLog(actor, "admin.property.update", "Property", property._id, {
      title: property.title,
      listingStatus: property.listingStatus,
      featured: property.featured,
      isActive: property.isActive,
    });
    return property;
  },

  async deleteProperty(actor, id) {
    const result = await propertyService.deleteByOwner(id, actor);
    await writeLog(actor, "admin.property.delete", "Property", id, {});
    return result;
  },

  async listCoworkingSpaces(params = {}) {
    return coworkingService.listForAdmin(params);
  },

  async createCoworkingSpace(actor, data) {
    const space = await coworkingService.create(data);
    await writeLog(actor, "admin.coworking.create", "CoworkingSpace", space._id, { title: space.title });
    return space;
  },

  async updateCoworkingSpace(actor, id, data) {
    const space = await coworkingService.updateById(id, data, actor);
    await writeLog(actor, "admin.coworking.update", "CoworkingSpace", space._id, { title: space.title });
    return space;
  },

  async deleteCoworkingSpace(actor, id) {
    const result = await coworkingService.deleteById(id, actor);
    await writeLog(actor, "admin.coworking.delete", "CoworkingSpace", id, {});
    return result;
  },
};

module.exports = adminService;
