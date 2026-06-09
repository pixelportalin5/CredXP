const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    propertyTitle: {
      type: String,
      required: true,
      trim: true,
    },
    agent: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      avatar: { type: String },
    },
    propertySnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proposal", proposalSchema);
