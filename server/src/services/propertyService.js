const Property = require("../models/Property");

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
  async getAll({ page = 1, limit = 10, type, status, city, minPrice, maxPrice, sort }) {
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
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
    return Property.find({ status })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
  },

  /**
   * Get a single property by ID
   */
  async getById(id) {
    return Property.findById(id);
  },

  /**
   * Search properties by text query
   */
  async search({ q, type, city, minPrice, maxPrice, sort, page = 1, limit = 10 }) {
    const query = {};

    if (q) {
      query.title = { $regex: q, $options: "i" };
    }
    if (type) query.type = type;
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
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
  async create(data) {
    return Property.create(data);
  },
};

module.exports = propertyService;
