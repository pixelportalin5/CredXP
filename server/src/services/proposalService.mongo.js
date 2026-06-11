const Proposal = require("../models/Proposal");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const { buildProposalSnapshot, publicProposal } = require("../utils/buildProposalSnapshot");
const { resolveProposalCoverImage } = require("../utils/resolveProposalCoverImage");

const proposalService = {
  async create(user, body) {
    const { propertyId, preparedFor, agentResearch, overviewFields, detailFields } = body;
    if (!propertyId) throw new ApiError(400, "propertyId is required");
    if (!preparedFor?.name?.trim()) throw new ApiError(400, "Prepared For name is required");

    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(404, "Property not found");

    const snapshot = buildProposalSnapshot(user, property.toObject());
    const rawCover = property.coverImage || (Array.isArray(property.images) ? property.images[0] : "") || "";
    const coverImage = await resolveProposalCoverImage(rawCover);

    const proposal = await Proposal.create({
      createdBy: user._id,
      propertyId: property._id,
      propertyTitle: property.title,
      propertyType: property.type,
      agent: snapshot.agent,
      propertySnapshot: snapshot.property,
      coverImage,
      preparedFor: {
        name: preparedFor.name.trim(),
        email: preparedFor.email?.trim() || undefined,
        phone: preparedFor.phone?.trim() || undefined,
      },
      agentResearch: agentResearch
        ? {
            pros: (agentResearch.pros || []).map((item) => String(item).trim()).filter(Boolean).slice(0, 3),
            cons: (agentResearch.cons || []).map((item) => String(item).trim()).filter(Boolean).slice(0, 3),
          }
        : undefined,
      overviewFields: overviewFields || undefined,
      detailFields: detailFields || undefined,
    });

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

  async list() {
    const proposals = await Proposal.find().sort({ createdAt: -1 }).limit(100);
    return proposals.map(publicProposal);
  },

  async getById(id) {
    const proposal = await Proposal.findById(id);
    return proposal ? publicProposal(proposal) : null;
  },

  async update(id, data) {
    const proposal = await Proposal.findByIdAndUpdate(id, data, { new: true });
    return proposal ? publicProposal(proposal) : null;
  },

  async delete(id) {
    const proposal = await Proposal.findByIdAndDelete(id);
    if (!proposal) return null;
    return { id };
  },
};

module.exports = proposalService;
