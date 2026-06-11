const prisma = require("../prisma");
const { externalIdWhere } = require("./legacyId");

async function findUser(id) {
  if (!id) return null;
  return prisma.user.findFirst({ where: externalIdWhere(id) });
}

async function findProperty(id) {
  if (!id) return null;
  return prisma.property.findFirst({ where: externalIdWhere(id) });
}

async function findCoworkingSpace(id) {
  if (!id) return null;
  return prisma.coworkingSpace.findFirst({ where: externalIdWhere(id) });
}

async function findEnquiry(id) {
  if (!id) return null;
  return prisma.enquiry.findFirst({ where: externalIdWhere(id) });
}

async function findProposal(id) {
  if (!id) return null;
  return prisma.proposal.findFirst({ where: externalIdWhere(id) });
}

async function findSavedProperty(id) {
  if (!id) return null;
  return prisma.savedProperty.findFirst({ where: externalIdWhere(id) });
}

async function findContactMessage(id) {
  if (!id) return null;
  return prisma.contactMessage.findFirst({ where: externalIdWhere(id) });
}

async function findAuditLog(id) {
  if (!id) return null;
  return prisma.auditLog.findFirst({ where: externalIdWhere(id) });
}

module.exports = {
  findUser,
  findProperty,
  findCoworkingSpace,
  findEnquiry,
  findProposal,
  findSavedProperty,
  findContactMessage,
  findAuditLog,
};
