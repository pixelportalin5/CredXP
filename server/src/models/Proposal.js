const mongoose = require("mongoose");

const OVERVIEW_FIELDS_SCHEMA = {
  buildingName: { type: String, trim: true },
  totalArea: { type: String, trim: true },
  numberOfLifts: { type: String, trim: true },
  numberOfFloors: { type: String, trim: true },
  location: { type: String, trim: true },
};

const DETAIL_FIELDS_SCHEMA = {
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
};

// One entry per property included in the proposal. A proposal always has
// at least one entry; multiple entries let an agent bundle several
// properties into a single proposal document.
const proposalPropertySchema = new mongoose.Schema(
  {
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
    overviewFields: OVERVIEW_FIELDS_SCHEMA,
    detailFields: DETAIL_FIELDS_SCHEMA,
    agentResearch: {
      pros: [{ type: String, trim: true }],
      cons: [{ type: String, trim: true }],
    },
  },
  { _id: false }
);

const proposalSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agent: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      avatar: { type: String },
      avatarPublicId: { type: String },
    },
    preparedFor: {
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    properties: {
      type: [proposalPropertySchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "A proposal must include at least one property.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proposal", proposalSchema);
