const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Office Space", "Shop"],
      required: [true, "Property type is required"],
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    size: {
      type: Number,
      required: [true, "Size is required"],
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["Recently Posted", "Trending"],
      default: "Recently Posted",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
