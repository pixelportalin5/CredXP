const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: false,
    },
    coworkingSpaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingSpace",
      required: false,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userArchived: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    closedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

enquirySchema.pre("validate", function validateReference(next) {
  if (!this.propertyId && !this.coworkingSpaceId) {
    this.invalidate("propertyId", "Property or coworking space is required");
  }
  next();
});

module.exports = mongoose.model("Enquiry", enquirySchema);
