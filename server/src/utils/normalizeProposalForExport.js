const { resolveProposalCoverImage } = require("../utils/resolveProposalCoverImage");

function absolutizeClientUrl(value, clientUrl) {
  if (!value || typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${clientUrl.replace(/\/$/, "")}${trimmed}`;
  return trimmed;
}

async function normalizeProposalForExport(proposal, clientUrl) {
  const normalized = { ...proposal };

  if (normalized.coverImage) {
    const resolved = await resolveProposalCoverImage(normalized.coverImage);
    normalized.coverImage = absolutizeClientUrl(resolved || normalized.coverImage, clientUrl);
  }

  if (normalized.agent?.avatar) {
    normalized.agent = {
      ...normalized.agent,
      avatar: absolutizeClientUrl(normalized.agent.avatar, clientUrl),
    };
  }

  return normalized;
}

module.exports = {
  absolutizeClientUrl,
  normalizeProposalForExport,
};
