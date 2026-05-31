const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");

const enquiryService = {
  async create(data, user) {
    const property = await Property.findById(data.propertyId);
    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    const enquiry = await Enquiry.create({
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      message: data.message,
      propertyId: property._id,
      sellerId: property.seller || undefined,
      userId: user?._id,
    });

    await Property.findByIdAndUpdate(property._id, { $inc: { enquiryCount: 1 } });

    return enquiry.populate("propertyId", "title type location price");
  },

  async getForSeller(sellerId, { q, propertyId } = {}) {
    const query = { sellerId };
    if (propertyId) query.propertyId = propertyId;
    if (q) {
      query.$or = [
        { customerName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    return Enquiry.find(query)
      .populate("propertyId", "title type location price")
      .sort({ createdAt: -1 });
  },

  async getForUser(userId, { status = "open" } = {}) {
    const query = { userId, userArchived: { $ne: true } };
    if (status) query.status = status;

    return Enquiry.find(query)
      .populate("propertyId", "title type location price images status financials size")
      .sort({ createdAt: -1 });
  },

  async closeForSeller(sellerId, enquiryId) {
    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: enquiryId, sellerId },
      { status: "closed", closedAt: new Date() },
      { new: true }
    ).populate("propertyId", "title type location price");

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
};

module.exports = enquiryService;
