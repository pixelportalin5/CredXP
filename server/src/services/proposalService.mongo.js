const Proposal = require("../models/Proposal");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const { buildAgentSnapshot, buildPropertySnapshotRows, publicProposal } = require("../utils/buildProposalSnapshot");
const { resolveProposalCoverImage } = require("../utils/resolveProposalCoverImage");

async function buildPropertyEntry(input) {
  const { propertyId, overviewFields, detailFields, agentResearch } = input || {};
  if (!propertyId) throw new ApiError(400, "propertyId is required for each property");

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, "Property not found");

  const propertySnapshot = buildPropertySnapshotRows(property.toObject());
  const rawCover = property.coverImage || (Array.isArray(property.images) ? property.images[0] : "") || "";
  const coverImage = await resolveProposalCoverImage(rawCover);

  return {
    propertyId: property._id,
    propertyTitle: property.title,
    propertyType: property.type,
    propertySnapshot,
    coverImage,
    overviewFields: overviewFields || undefined,
    detailFields: detailFields || undefined,
    agentResearch: agentResearch
      ? {
          pros: (agentResearch.pros || []).map((item) => String(item).trim()).filter(Boolean).slice(0, 3),
          cons: (agentResearch.cons || []).map((item) => String(item).trim()).filter(Boolean).slice(0, 3),
        }
      : undefined,
  };
}

async function buildPropertyEntries(properties) {
  if (!Array.isArray(properties) || properties.length === 0) {
    throw new ApiError(400, "At least one property is required");
  }

  const seen = new Set();
  properties.forEach((item) => {
    const key = String(item?.propertyId || "");
    if (seen.has(key)) throw new ApiError(400, "Each property can only be added once per proposal");
    seen.add(key);
  });

  return Promise.all(properties.map(buildPropertyEntry));
}

function buildPreparedFor(preparedFor) {
  if (!preparedFor?.name?.trim()) throw new ApiError(400, "Prepared For name is required");
  return {
    name: preparedFor.name.trim(),
    email: preparedFor.email?.trim() || undefined,
    phone: preparedFor.phone?.trim() || undefined,
  };
}

const proposalService = {
  async create(user, body) {
    const { properties, preparedFor } = body;

    const preparedForDoc = buildPreparedFor(preparedFor);
    const entries = await buildPropertyEntries(properties);

    const proposal = await Proposal.create({
      createdBy: user._id,
      agent: buildAgentSnapshot(user),
      preparedFor: preparedForDoc,
      properties: entries,
    });

    return publicProposal(proposal);
  },

  async updateByUser(userId, id, body) {
    const proposal = await Proposal.findOne({ _id: id, createdBy: userId });
    if (!proposal) throw new ApiError(404, "Proposal not found");

    const { properties, preparedFor } = body;

    proposal.preparedFor = buildPreparedFor(preparedFor);
    proposal.properties = await buildPropertyEntries(properties);

    await proposal.save();
    return publicProposal(proposal);
  },

  async listByUser(userId) {
    const proposals = await Proposal.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(100);
    return proposals.map(publicProposal);
  },

  async getByIdForUser(userId, id) {
    const proposal = await Proposal.findOne({ _id: id, createdBy: userId });
    if (!proposal) throw new ApiError(404, "Proposal not found");
    return publicProposal(proposal);
  },

  async getPublic(id) {
    const proposal = await Proposal.findById(id);
    if (!proposal) throw new ApiError(404, "Proposal not found");
    return publicProposal(proposal);
  },

  async deleteByUser(userId, id) {
    const proposal = await Proposal.findOneAndDelete({ _id: id, createdBy: userId });
    if (!proposal) throw new ApiError(404, "Proposal not found");
    return { id };
  },
};

module.exports = proposalService;
