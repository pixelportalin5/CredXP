const Property = require("../models/Property");
const Enquiry = require("../models/Enquiry");
const ApiError = require("../utils/ApiError");
const { PROPERTY_LIST_FIELDS, normalizePropertyListItem } = require("../utils/listPayload");
const { applyCoverImage } = require("../utils/imageThumbnail");
const { getCacheKey, getCached, setCached, invalidatePrefix } = require("../utils/queryCache");
const { applyPropertyFilters } = require("../utils/propertyFilters");

/**
 * Build sort object from query string
 */
function buildSort(sort) {
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    size_asc: { size: 1 },
    size_desc: { size: -1 },
    yield_desc: { "financials.rentalYield": -1 },
  };
  return sortMap[sort] || { createdAt: -1 };
}

/**
 * Property service - handles business logic for properties
 */
const propertyService = {
  /**
   * Get all properties with pagination, filtering, and sorting
   */
  async getAll({ page = 1, limit = 10, type, category, status, city, minPrice, maxPrice, minSize, maxSize, minYield, maxYield, furnishing, sort }) {
    const cacheKey = getCacheKey("properties", { page, limit, type, category, status, city, minPrice, maxPrice, minSize, maxSize, minYield, maxYield, furnishing, sort });
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const query = {
      isActive: { $ne: false },
      listingStatus: { $in: ["published", null] },
    };

    applyPropertyFilters(query, { category, type, status, furnishing, city, minPrice, maxPrice, minSize, maxSize, minYield, maxYield });

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .select(PROPERTY_LIST_FIELDS)
        .sort(buildSort(sort))
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Property.countDocuments(query),
    ]);

    const normalized = properties.map(normalizePropertyListItem);
    const result = {
      properties: normalized,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    };

    setCached(cacheKey, result);
    return result;
  },

  /**
   * Get properties by status (for homepage sections)
   */
  async getByStatus(status, limit = 6) {
    const properties = await Property.find({
      status,
      isActive: { $ne: false },
      listingStatus: { $in: ["published", null] },
    })
      .select(PROPERTY_LIST_FIELDS)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return properties.map(normalizePropertyListItem);
  },

  /**
   * Get a single property by ID
   */
  async getById(id) {
    const property = await Property.findById(id).lean();
    if (property) {
      void Property.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }
    return property;
  },

  /**
   * Search properties by text query
   */
  async search({ q, type, category, status, city, minPrice, maxPrice, minSize, maxSize, minYield, maxYield, furnishing, sort, page = 1, limit = 10 }) {
    const cacheKey = getCacheKey("properties-search", { q, type, category, status, city, minPrice, maxPrice, minSize, maxSize, minYield, maxYield, furnishing, sort, page, limit });
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const query = {
      isActive: { $ne: false },
      listingStatus: { $in: ["published", null] },
    };

    if (q) {
      const searchRegex = { $regex: q, $options: "i" };
      query.$or = [
        { title: searchRegex },
        { buildingName: searchRegex },
        { "location.city": searchRegex },
        { "location.micromarket": searchRegex },
        { "tenant.name": searchRegex },
      ];
    }
    applyPropertyFilters(query, { category, type, status, furnishing, city, minPrice, maxPrice, minSize, maxSize, minYield, maxYield });

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .select(PROPERTY_LIST_FIELDS)
        .sort(buildSort(sort))
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Property.countDocuments(query),
    ]);

    const normalized = properties.map(normalizePropertyListItem);
    const result = {
      properties: normalized,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    };

    setCached(cacheKey, result);
    return result;
  },

  /**
   * Create a new property
   */
  async create(data, user) {
    const payload = await applyCoverImage({ ...data });

    if (user) {
      if (!["seller", "admin"].includes(user.role)) {
        throw new ApiError(403, "Seller access required");
      }

      if (!Array.isArray(payload.images) || payload.images.length !== 3) {
        throw new ApiError(400, "Seller-created listings require exactly 3 images");
      }

      payload.seller = user._id;
      payload.isActive = payload.isActive !== false;
      payload.listingStatus = payload.listingStatus || "published";
    }

    const created = await Property.create(payload);
    invalidatePrefix("properties");
    return created;
  },

  async getSellerProperties(sellerId) {
    return Property.find({ seller: sellerId }).select("-images").sort({ createdAt: -1 });
  },

  async updateByOwner(id, data, user) {
    const property = await Property.findById(id);
    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    const isOwner = property.seller?.toString() === user._id.toString();
    if (!isOwner && user.role !== "admin") {
      throw new ApiError(403, "You can only update your own listings");
    }

    if (property.seller && data.images && data.images.length !== 3) {
      throw new ApiError(400, "Seller-created listings require exactly 3 images");
    }

    const nextData = data.images ? await applyCoverImage(data) : data;
    Object.assign(property, nextData);
    await property.save();
    invalidatePrefix("properties");
    return property;
  },

  async deleteByOwner(id, user) {
    const property = await Property.findById(id);
    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    const isOwner = property.seller?.toString() === user._id.toString();
    if (!isOwner && user.role !== "admin") {
      throw new ApiError(403, "You can only delete your own listings");
    }

    await Enquiry.deleteMany({ propertyId: property._id });
    await property.deleteOne();
    invalidatePrefix("properties");
    return { id };
  },
};

module.exports = propertyService;
