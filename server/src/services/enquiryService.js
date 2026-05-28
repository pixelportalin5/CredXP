const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");

const enquiryService = {
  async create(data) {
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
};

module.exports = enquiryService;
