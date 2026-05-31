const SavedProperty = require("../models/SavedProperty");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");

const savedPropertyService = {
  async list(userId) {
    const saved = await SavedProperty.find({ userId })
      .populate("propertyId")
      .sort({ createdAt: -1 });

    return saved
      .map((item) => item.propertyId)
      .filter(Boolean);
  },

  async save(userId, propertyId) {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    await SavedProperty.updateOne(
      { userId, propertyId },
      { $setOnInsert: { userId, propertyId } },
      { upsert: true }
    );

    return property;
  },

  async remove(userId, propertyId) {
    await SavedProperty.deleteOne({ userId, propertyId });
    return { propertyId };
  },
};

module.exports = savedPropertyService;
