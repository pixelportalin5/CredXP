const mongoose = require("mongoose");

const coworkingSpaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    operator: {
      type: String,
      required: [true, "Operator is required"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      micromarket: { type: String },
      landmark: { type: String },
    },
    monthlySeatPrice: {
      type: Number,
      required: [true, "Monthly seat price is required"],
    },
    priceLabel: {
      type: String,
      required: [true, "Price label is required"],
    },
    workspaceType: {
      type: String,
      default: "Coworking Space",
    },
    images: {
      type: [{ type: String }],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one image is required",
      },
    },
    coverImage: {
      type: String,
      default: "",
    },
    imagePublicIds: {
      type: [{ type: String }],
      default: undefined,
    },
    coverImagePublicId: {
      type: String,
      default: "",
    },
    amenities: [{ type: String }],
    highlights: [{ type: String }],
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    specs: {
      seatsFrom: { type: Number },
      privateCabins: { type: Boolean },
      meetingRooms: { type: Boolean },
      internet: { type: Boolean },
      parking: { type: Boolean },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    enquiryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    listingStatus: {
      type: String,
      enum: ["draft", "published", "paused"],
      default: "published",
    },
  },
  { timestamps: true }
);

coworkingSpaceSchema.index({ isActive: 1, listingStatus: 1, featured: -1, createdAt: -1 });
coworkingSpaceSchema.index({ "location.city": 1, isActive: 1 });
coworkingSpaceSchema.index({ operator: 1, isActive: 1 });

module.exports = mongoose.model("CoworkingSpace", coworkingSpaceSchema);
