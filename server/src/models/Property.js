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
      enum: ["Pre-Leased Office", "Office Space", "Retail/SCO", "Coworking", "Coworking Space", "Shop", "Warehouse", "Commercial Land"],
      required: [true, "Property type is required"],
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
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    size: {
      type: Number,
      required: [true, "Size is required"],
    },
    financials: {
      price: { type: Number },
      priceUnit: { type: String, enum: ["month", "year", "sqft", "total"] },
      securityDeposit: { type: Number },
      maintenanceCharges: { type: Number },
      rentalYield: { type: Number },
      capRate: { type: Number },
      escalation: { type: String },
    },
    specs: {
      size: { type: Number },
      sizeUnit: { type: String, enum: ["sqft", "sqm"] },
      floors: { type: Number },
      totalFloors: { type: Number },
      furnishing: { type: String, enum: ["Fully Furnished", "Semi Furnished", "Bare Shell", "Warm Shell"] },
      parking: { type: Number },
      cabins: { type: Number },
      workstations: { type: Number },
      meetingRooms: { type: Number },
      pantry: { type: Boolean },
      washrooms: { type: Number },
    },
    tenant: {
      name: { type: String },
      industry: { type: String },
      leaseExpiry: { type: String },
      lockInPeriod: { type: String },
    },
    amenities: [{ type: String }],
    images: {
      type: [{ type: String }],
      validate: {
        validator(value) {
          if (!this.seller) return true;
          return Array.isArray(value) && value.length === 3;
        },
        message: "Seller-created listings require exactly 3 images",
      },
    },
    status: {
      type: String,
      enum: ["Recently Posted", "Trending"],
      default: "Recently Posted",
    },
    grade: {
      type: String,
      enum: ["A", "A+", "B", "B+"],
    },
    occupancy: {
      type: Number,
    },
    reraId: {
      type: String,
    },
    buildingName: {
      type: String,
    },
    highlights: [{ type: String }],
    description: {
      type: String,
      required: [true, "Description is required"],
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
      enum: ["draft", "published", "paused", "sold"],
      default: "published",
    },
  },
  { timestamps: true }
);

propertySchema.index({ createdAt: -1 });
propertySchema.index({ price: 1 });
propertySchema.index({ size: 1 });
propertySchema.index({ "financials.rentalYield": -1 });

module.exports = mongoose.model("Property", propertySchema);
