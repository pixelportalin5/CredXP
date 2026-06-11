const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { findUser, findProperty, findCoworkingSpace, findEnquiry } = require("../lib/prisma/resolveEntity");
const { toApiEnquiry, toApiProperty, toApiCoworking } = require("../lib/prisma/mappers");

const propertySelect = {
  title: true,
  type: true,
  locationAddress: true,
  locationCity: true,
  locationState: true,
  price: true,
  legacyMongoId: true,
  id: true,
};

const coworkingSelect = {
  title: true,
  operator: true,
  locationAddress: true,
  locationCity: true,
  locationState: true,
  monthlySeatPrice: true,
  priceLabel: true,
  images: true,
  legacyMongoId: true,
  id: true,
};

function compactProperty(row) {
  if (!row) return null;
  return {
    _id: row.legacyMongoId,
    title: row.title,
    type: row.type,
    location: { address: row.locationAddress, city: row.locationCity, state: row.locationState },
    price: row.price,
  };
}

function compactCoworking(row) {
  if (!row) return null;
  return {
    _id: row.legacyMongoId,
    title: row.title,
    operator: row.operator,
    location: { address: row.locationAddress, city: row.locationCity, state: row.locationState },
    monthlySeatPrice: row.monthlySeatPrice,
    priceLabel: row.priceLabel,
    images: row.images,
  };
}

const enquiryService = {
  async create(data, user) {
    const property = data.propertyId ? await findProperty(data.propertyId) : null;
    const coworkingSpace = data.coworkingSpaceId ? await findCoworkingSpace(data.coworkingSpaceId) : null;

    if (data.propertyId && !property) throw new ApiError(404, "Property not found");
    if (data.coworkingSpaceId && !coworkingSpace) throw new ApiError(404, "Coworking space not found");
    if (!property && !coworkingSpace) throw new ApiError(400, "Property or coworking space is required");

    const actor = user?._id ? await findUser(user._id) : null;
    const seller = property?.sellerId
      ? await prisma.user.findUnique({ where: { id: property.sellerId } })
      : coworkingSpace?.sellerId
        ? await prisma.user.findUnique({ where: { id: coworkingSpace.sellerId } })
        : null;

    const enquiry = await prisma.enquiry.create({
      data: {
        id: newUuid(),
        legacyMongoId: newLegacyMongoId(),
        customerName: data.customerName,
        email: String(data.email).toLowerCase(),
        phone: data.phone || null,
        message: data.message || null,
        propertyId: property?.id || null,
        coworkingSpaceId: coworkingSpace?.id || null,
        sellerId: seller?.id || null,
        userId: actor?.id || null,
      },
      include: {
        property: { select: propertySelect },
        coworkingSpace: { select: coworkingSelect },
      },
    });

    if (property) {
      await prisma.property.update({
        where: { id: property.id },
        data: { enquiryCount: { increment: 1 } },
      });
    }
    if (coworkingSpace) {
      await prisma.coworkingSpace.update({
        where: { id: coworkingSpace.id },
        data: { enquiryCount: { increment: 1 } },
      });
    }

    return {
      ...toApiEnquiry(enquiry),
      propertyId: compactProperty(enquiry.property),
      coworkingSpaceId: compactCoworking(enquiry.coworkingSpace),
    };
  },

  async getForSeller(sellerId, { q, propertyId, coworkingSpaceId } = {}) {
    const seller = await findUser(sellerId);
    if (!seller) return [];

    const where = { sellerId: seller.id };
    if (propertyId) {
      const property = await findProperty(propertyId);
      if (property) where.propertyId = property.id;
    }
    if (coworkingSpaceId) {
      const space = await findCoworkingSpace(coworkingSpaceId);
      if (space) where.coworkingSpaceId = space.id;
    }
    if (q) {
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.enquiry.findMany({
      where,
      include: {
        property: { select: propertySelect },
        coworkingSpace: { select: coworkingSelect },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      ...toApiEnquiry(row),
      propertyId: compactProperty(row.property),
      coworkingSpaceId: compactCoworking(row.coworkingSpace),
    }));
  },

  async getForUser(userId, { status = "open" } = {}) {
    const user = await findUser(userId);
    if (!user) return [];

    const where = { userId: user.id, userArchived: false };
    if (status) where.status = status;

    const rows = await prisma.enquiry.findMany({
      where,
      include: {
        property: true,
        coworkingSpace: { select: coworkingSelect },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      ...toApiEnquiry(row),
      propertyId: row.property ? toApiProperty(row.property, { includeAll: false }) : null,
      coworkingSpaceId: compactCoworking(row.coworkingSpace),
    }));
  },

  async closeForSeller(sellerId, enquiryId) {
    const seller = await findUser(sellerId);
    const enquiry = await findEnquiry(enquiryId);
    if (!enquiry || !seller || enquiry.sellerId !== seller.id) {
      throw new ApiError(404, "Enquiry not found");
    }

    const updated = await prisma.enquiry.update({
      where: { id: enquiry.id },
      data: { status: "closed", closedAt: new Date() },
      include: {
        property: { select: propertySelect },
        coworkingSpace: { select: coworkingSelect },
      },
    });

    return {
      ...toApiEnquiry(updated),
      propertyId: compactProperty(updated.property),
      coworkingSpaceId: compactCoworking(updated.coworkingSpace),
    };
  },

  async archiveForUser(userId, enquiryId) {
    const user = await findUser(userId);
    const enquiry = await findEnquiry(enquiryId);
    if (!enquiry || !user || enquiry.userId !== user.id) {
      throw new ApiError(404, "Enquiry not found");
    }

    await prisma.enquiry.update({
      where: { id: enquiry.id },
      data: { userArchived: true },
    });

    return { id: enquiry.legacyMongoId };
  },

  async clearForUser(userId) {
    const user = await findUser(userId);
    if (!user) return { count: 0 };
    const result = await prisma.enquiry.updateMany({
      where: { userId: user.id, userArchived: false },
      data: { userArchived: true },
    });
    return { count: result.count };
  },

  async list({ limit = 100 } = {}) {
    const rows = await prisma.enquiry.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { property: { select: propertySelect }, coworkingSpace: { select: coworkingSelect } },
    });
    return rows.map(toApiEnquiry);
  },

  async getById(id) {
    const row = await prisma.enquiry.findFirst({
      where: { OR: [{ legacyMongoId: String(id) }, { id: String(id) }] },
      include: { property: { select: propertySelect }, coworkingSpace: { select: coworkingSelect } },
    });
    return row ? toApiEnquiry(row) : null;
  },

  async update(id, data) {
    const enquiry = await findEnquiry(id);
    if (!enquiry) return null;
    const updated = await prisma.enquiry.update({
      where: { id: enquiry.id },
      data: {
        status: data.status ?? enquiry.status,
        message: data.message ?? enquiry.message,
      },
      include: { property: { select: propertySelect }, coworkingSpace: { select: coworkingSelect } },
    });
    return toApiEnquiry(updated);
  },

  async delete(id) {
    const enquiry = await findEnquiry(id);
    if (!enquiry) return null;
    await prisma.enquiry.delete({ where: { id: enquiry.id } });
    return { id: enquiry.legacyMongoId };
  },
};

module.exports = enquiryService;
