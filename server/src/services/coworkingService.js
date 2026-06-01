const CoworkingSpace = require("../models/CoworkingSpace");

const coworkingService = {
  async getAll() {
    return CoworkingSpace.find({
      isActive: { $ne: false },
      listingStatus: "published",
    }).sort({ featured: -1, createdAt: -1 });
  },

  async getById(id) {
    const space = await CoworkingSpace.findById(id);
    if (space) {
      await CoworkingSpace.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }
    return space;
  },
};

module.exports = coworkingService;
