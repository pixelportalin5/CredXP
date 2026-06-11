const CoworkingSpace = require("../models/CoworkingSpace");
const ApiError = require("../utils/ApiError");
const { normalizeCoworkingListItem } = require("../utils/listPayload");
const { applyCoverImage } = require("../utils/imageThumbnail");
const { getCacheKey, getCached, setCached, invalidatePrefix } = require("../utils/queryCache");

function buildSort(sort) {
  const sortMap = {
    newest: { createdAt: -1 },
    featured: { featured: -1, createdAt: -1 },
    price_asc: { monthlySeatPrice: 1 },
    price_desc: { monthlySeatPrice: -1 },
  };
  return sortMap[sort] || { featured: -1, createdAt: -1 };
}

function buildQuery({ city, operator, minPrice, maxPrice, minSeats, q, includeInactive = false }) {
  const query = includeInactive ? {} : {
    isActive: { $ne: false },
    listingStatus: "published",
  };

  if (city) query["location.city"] = { $regex: city, $options: "i" };
  if (operator) query.operator = { $regex: operator, $options: "i" };
  if (minPrice || maxPrice) {
    query.monthlySeatPrice = {};
    if (minPrice) query.monthlySeatPrice.$gte = Number(minPrice);
    if (maxPrice) query.monthlySeatPrice.$lte = Number(maxPrice);
  }
  if (minSeats) query["specs.seatsFrom"] = { $gte: Number(minSeats) };
  if (q) {
    const search = { $regex: q, $options: "i" };
    query.$or = [
      { title: search },
      { operator: search },
      { description: search },
      { "location.city": search },
      { "location.micromarket": search },
    ];
  }

  return query;
}

const coworkingService = {
  async getAll(params = {}) {
    const { page = 1, limit = 20, sort, ...filters } = params;
    const cacheKey = getCacheKey("coworking", { page, limit, sort, ...filters });
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const query = buildQuery(filters);
    const skip = (Number(page) - 1) * Number(limit);

    const [spaces, total] = await Promise.all([
      CoworkingSpace.find(query)
        .select("title operator location monthlySeatPrice priceLabel workspaceType coverImage amenities specs featured isActive createdAt views")
        .sort(buildSort(sort))
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      CoworkingSpace.countDocuments(query),
    ]);

    const result = {
      spaces: spaces.map(normalizeCoworkingListItem),
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
    const query = buildQuery({ ...params, includeInactive: true });
    return CoworkingSpace.find(query)
      .select("-images")
      .populate("seller", "name email role")
      .sort({ createdAt: -1 })
      .limit(150);
  },

  async getSellerSpaces(sellerId) {
    return CoworkingSpace.find({ seller: sellerId })
      .select("-images")
      .sort({ createdAt: -1 });
  },

  async getById(id) {
    const space = await CoworkingSpace.findById(id).lean();
    if (space) {
      void CoworkingSpace.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }
    return space;
  },

  async create(data, sellerId) {
    const payload = await applyCoverImage({
      ...data,
      seller: sellerId || data.seller,
      isActive: data.isActive !== false,
      listingStatus: data.listingStatus || "published",
    });
    const created = await CoworkingSpace.create(payload);
    invalidatePrefix("coworking");
    return created;
  },

  async updateById(id, data, user) {
    const space = await CoworkingSpace.findById(id);
    if (!space) throw new ApiError(404, "Coworking space not found");

    const isOwner = space.seller?.toString() === user._id.toString();
    if (!isOwner && !["admin", "employee"].includes(user.role)) {
      throw new ApiError(403, "You can only update your own coworking spaces");
    }

    const nextData = data.images ? await applyCoverImage(data) : data;
    Object.assign(space, nextData);
    await space.save();
    invalidatePrefix("coworking");
    return space;
  },

  async deleteById(id, user) {
    const space = await CoworkingSpace.findById(id);
    if (!space) throw new ApiError(404, "Coworking space not found");

    const isOwner = space.seller?.toString() === user._id.toString();
    if (!isOwner && !["admin", "employee"].includes(user.role)) {
      throw new ApiError(403, "You can only delete your own coworking spaces");
    }

    await space.deleteOne();
    invalidatePrefix("coworking");
    return { id };
  },
};

module.exports = coworkingService;
