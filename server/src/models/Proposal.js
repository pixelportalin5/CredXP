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
    propertyType: {
      type: String,
      trim: true,
    },
    agent: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      avatar: { type: String },
      avatarPublicId: { type: String },
    },
    propertySnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    coverImage: {
      type: String,
    },
    coverImagePublicId: {
      type: String,
      default: "",
    },
    preparedFor: {
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    agentResearch: {
      pros: [{ type: String, trim: true }],
      cons: [{ type: String, trim: true }],
    },
    overviewFields: {
      buildingName: { type: String, trim: true },
      totalArea: { type: String, trim: true },
      numberOfLifts: { type: String, trim: true },
      numberOfFloors: { type: String, trim: true },
      location: { type: String, trim: true },
    },
    detailFields: {
      tenant: { type: String, trim: true },
      aboutTenant: { type: String, trim: true },
      totalAreaLeased: { type: String, trim: true },
      exactAreaOffered: { type: String, trim: true },
      rentPerSqft: { type: String, trim: true },
      lockIn: { type: String, trim: true },
      leaseTenure: { type: String, trim: true },
      escalation: { type: String, trim: true },
      noticePeriod: { type: String, trim: true },
      rentCommencementDate: { type: String, trim: true },
      offeredRoi: { type: String, trim: true },
      expectedClosures: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proposal", proposalSchema);
