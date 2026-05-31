const mongoose = require("mongoose");

const savedPropertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },
  },
  { timestamps: true }
);

savedPropertySchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("SavedProperty", savedPropertySchema);
