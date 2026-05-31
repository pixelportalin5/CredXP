const Property = require("../models/Property");
const Enquiry = require("../models/Enquiry");
const ApiError = require("../utils/ApiError");

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
  async getAll({ page = 1, limit = 10, type, status, city, minPrice, maxPrice, minSize, maxSize, minYield, maxYield, sort }) {
    const query = {
      isActive: { $ne: false },
      listingStatus: { $in: ["published", null] },
    };

    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minSize || maxSize) {
      query.size = {};
      if (minSize) query.size.$gte = Number(minSize);
      if (maxSize) query.size.$lte = Number(maxSize);
    }
    if (minYield || maxYield) {
      query["financials.rentalYield"] = {};
      if (minYield) query["financials.rentalYield"].$gte = Number(minYield);
      if (maxYield) query["financials.rentalYield"].$lte = Number(maxYield);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(buildSort(sort))
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query),
    ]);

    return {
      properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    };
  },

  /**
   * Get properties by status (for homepage sections)
   */
  async getByStatus(status, limit = 6) {
    return Property.find({
      status,
      isActive: { $ne: false },
      listingStatus: { $in: ["published", null] },
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
  },

  /**
   * Get a single property by ID
   */
  async getById(id) {
    const property = await Property.findById(id);
    if (property) {
      await Property.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }
    return property;
  },

  /**
   * Search properties by text query
   */
  async search({ q, type, status, city, minPrice, maxPrice, minSize, maxSize, minYield, maxYield, sort, page = 1, limit = 10 }) {
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
    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minSize || maxSize) {
      query.size = {};
      if (minSize) query.size.$gte = Number(minSize);
      if (maxSize) query.size.$lte = Number(maxSize);
    }
    if (minYield || maxYield) {
      query["financials.rentalYield"] = {};
      if (minYield) query["financials.rentalYield"].$gte = Number(minYield);
      if (maxYield) query["financials.rentalYield"].$lte = Number(maxYield);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(buildSort(sort))
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query),
    ]);

    return {
      properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    };
  },

  /**
   * Create a new property
   */
  async create(data, user) {
    const payload = { ...data };

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

    return Property.create(payload);
  },

  async getSellerProperties(sellerId) {
    return Property.find({ seller: sellerId }).sort({ createdAt: -1 });
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

    Object.assign(property, data);
    await property.save();
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
    return { id };
  },
};

module.exports = propertyService;
