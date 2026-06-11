const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { buildProposalSnapshot, publicProposal } = require("../utils/buildProposalSnapshot");
const { resolveProposalCoverImage } = require("../utils/resolveProposalCoverImage");
const { externalIdWhere, newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { findUser, findProperty, findProposal } = require("../lib/prisma/resolveEntity");
const { toApiProperty, PROPERTY_TYPE_TO_API } = require("../lib/prisma/mappers");

function toPublicFromPrisma(record) {
  return publicProposal({
    _id: record.legacyMongoId,
    propertyId: record.property?.legacyMongoId || record.propertyId,
    propertyTitle: record.propertyTitle,
    propertyType: PROPERTY_TYPE_TO_API[record.propertyType] || record.propertyType,
    agent: record.agent,
    propertySnapshot: record.propertySnapshot,
    coverImage: record.coverImage,
    preparedFor: record.preparedFor,
    agentResearch: record.agentResearch,
    overviewFields: record.overviewFields,
    detailFields: record.detailFields,
    createdAt: record.createdAt,
  });
}

const proposalService = {
  async create(user, body) {
    const { propertyId, preparedFor, agentResearch, overviewFields, detailFields } = body;
    if (!propertyId) throw new ApiError(400, "propertyId is required");
    if (!preparedFor?.name?.trim()) throw new ApiError(400, "Prepared For name is required");

    const actor = await findUser(user._id);
    const property = await findProperty(propertyId);
    if (!property) throw new ApiError(404, "Property not found");

    const snapshot = buildProposalSnapshot(
      { ...user, _id: actor.legacyMongoId },
      toApiProperty(property)
    );
    const rawCover = property.coverImage || (Array.isArray(property.images) ? property.images[0] : "") || "";
    const coverImage = await resolveProposalCoverImage(rawCover);

    const proposal = await prisma.proposal.create({
      data: {
        id: newUuid(),
        legacyMongoId: newLegacyMongoId(),
        createdById: actor.id,
        propertyId: property.id,
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
      },
      include: { createdBy: true, property: true },
    });

    return toPublicFromPrisma(proposal);
  },

  async listByUser(userId) {
    const user = await findUser(userId);
    if (!user) return [];
    const proposals = await prisma.proposal.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { createdBy: true, property: true },
    });
    return proposals.map(toPublicFromPrisma);
  },

  async getByIdForUser(userId, id) {
    const user = await findUser(userId);
    const proposal = await findProposal(id);
    if (!proposal || !user || proposal.createdById !== user.id) {
      throw new ApiError(404, "Proposal not found");
    }
    return toPublicFromPrisma(proposal);
  },

  async getPublic(id) {
    const proposal = await prisma.proposal.findFirst({
      where: externalIdWhere(id),
      include: { createdBy: true, property: true },
    });
    if (!proposal) throw new ApiError(404, "Proposal not found");
    return toPublicFromPrisma(proposal);
  },

  async deleteByUser(userId, id) {
    const user = await findUser(userId);
    const proposal = await findProposal(id);
    if (!proposal || !user || proposal.createdById !== user.id) {
      throw new ApiError(404, "Proposal not found");
    }
    await prisma.proposal.delete({ where: { id: proposal.id } });
    return { id: proposal.legacyMongoId };
  },

  async list() {
    const rows = await prisma.proposal.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { createdBy: true, property: true },
    });
    return rows.map(toPublicFromPrisma);
  },

  async getById(id) {
    const proposal = await prisma.proposal.findFirst({
      where: externalIdWhere(id),
      include: { createdBy: true, property: true },
    });
    return proposal ? toPublicFromPrisma(proposal) : null;
  },

  async update(id, data) {
    const proposal = await findProposal(id);
    if (!proposal) return null;
    const updated = await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        propertyTitle: data.propertyTitle ?? proposal.propertyTitle,
        coverImage: data.coverImage ?? proposal.coverImage,
      },
      include: { createdBy: true, property: true },
    });
    return toPublicFromPrisma(updated);
  },

  async delete(id) {
    const proposal = await findProposal(id);
    if (!proposal) return null;
    await prisma.proposal.delete({ where: { id: proposal.id } });
    return { id: proposal.legacyMongoId };
  },
};

module.exports = proposalService;
