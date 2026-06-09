const Proposal = require("../models/Proposal");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const { buildProposalSnapshot, publicProposal } = require("../utils/buildProposalSnapshot");

const proposalService = {
  async create(user, { propertyId }) {
    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(404, "Property not found");

    const snapshot = buildProposalSnapshot(user, property.toObject());

    const proposal = await Proposal.create({
      createdBy: user._id,
      propertyId: property._id,
      propertyTitle: property.title,
      agent: snapshot.agent,
      propertySnapshot: snapshot.property,
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
};

module.exports = proposalService;
