const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");
const CoworkingSpace = require("../models/CoworkingSpace");
const ApiError = require("../utils/ApiError");

const enquiryService = {
  async create(data, user) {
    const property = data.propertyId ? await Property.findById(data.propertyId) : null;
    const coworkingSpace = data.coworkingSpaceId ? await CoworkingSpace.findById(data.coworkingSpaceId) : null;

    if (data.propertyId && !property) {
      throw new ApiError(404, "Property not found");
    }
    if (data.coworkingSpaceId && !coworkingSpace) {
      throw new ApiError(404, "Coworking space not found");
    }
    if (!property && !coworkingSpace) {
      throw new ApiError(400, "Property or coworking space is required");
    }

    const enquiry = await Enquiry.create({
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      message: data.message,
      propertyId: property?._id,
      coworkingSpaceId: coworkingSpace?._id,
      sellerId: property?.seller || coworkingSpace?.seller || undefined,
      userId: user?._id,
    });

    if (property) {
      await Property.findByIdAndUpdate(property._id, { $inc: { enquiryCount: 1 } });
    }
    if (coworkingSpace) {
      await CoworkingSpace.findByIdAndUpdate(coworkingSpace._id, { $inc: { enquiryCount: 1 } });
    }

    return enquiry.populate([
      { path: "propertyId", select: "title type location price" },
      { path: "coworkingSpaceId", select: "title operator location monthlySeatPrice priceLabel images" },
    ]);
  },

  async getForSeller(sellerId, { q, propertyId, coworkingSpaceId } = {}) {
    const query = { sellerId };
    if (propertyId) query.propertyId = propertyId;
    if (coworkingSpaceId) query.coworkingSpaceId = coworkingSpaceId;
    if (q) {
      query.$or = [
        { customerName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    return Enquiry.find(query)
      .populate("propertyId", "title type location price")
      .populate("coworkingSpaceId", "title operator location monthlySeatPrice priceLabel images")
      .sort({ createdAt: -1 });
  },

  async getForUser(userId, { status = "open" } = {}) {
    const query = { userId, userArchived: { $ne: true } };
    if (status) query.status = status;

    return Enquiry.find(query)
      .populate("propertyId", "title type location price images status financials size")
      .populate("coworkingSpaceId", "title operator location monthlySeatPrice priceLabel images")
      .sort({ createdAt: -1 });
  },

  async closeForSeller(sellerId, enquiryId) {
    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: enquiryId, sellerId },
      { status: "closed", closedAt: new Date() },
      { new: true }
    )
      .populate("propertyId", "title type location price")
      .populate("coworkingSpaceId", "title operator location monthlySeatPrice priceLabel images");

    if (!enquiry) {
      throw new ApiError(404, "Enquiry not found");
    }

    return enquiry;
  },

  async archiveForUser(userId, enquiryId) {
    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: enquiryId, userId },
      { userArchived: true },
      { new: true }
    );

    if (!enquiry) {
      throw new ApiError(404, "Enquiry not found");
    }

    return { id: enquiryId };
  },

  async clearForUser(userId) {
    const result = await Enquiry.updateMany(
      { userId, userArchived: { $ne: true } },
      { userArchived: true }
    );

    return { count: result.modifiedCount || 0 };
  },

  async list({ limit = 100 } = {}) {
    return Enquiry.find().sort({ createdAt: -1 }).limit(limit).lean();
  },

  async getById(id) {
    return Enquiry.findById(id)
      .populate("propertyId", "title type location price")
      .populate("coworkingSpaceId", "title operator location monthlySeatPrice priceLabel images")
      .lean();
  },

  async update(id, data) {
    return Enquiry.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async delete(id) {
    const deleted = await Enquiry.findByIdAndDelete(id);
    if (!deleted) return null;
    return { id };
  },
};

module.exports = enquiryService;
