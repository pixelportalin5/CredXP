const { resolveProposalCoverImage } = require("../utils/resolveProposalCoverImage");

function absolutizeClientUrl(value, clientUrl) {
  if (!value || typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${clientUrl.replace(/\/$/, "")}${trimmed}`;
  return trimmed;
}

async function normalizeCoverImage(coverImage, clientUrl) {
  if (!coverImage) return coverImage;
  const resolved = await resolveProposalCoverImage(coverImage);
  return absolutizeClientUrl(resolved || coverImage, clientUrl);
}

async function normalizeProposalForExport(proposal, clientUrl) {
  const normalized = { ...proposal };

  if (normalized.coverImage) {
    normalized.coverImage = await normalizeCoverImage(normalized.coverImage, clientUrl);
  }

  if (Array.isArray(normalized.properties) && normalized.properties.length > 0) {
    normalized.properties = await Promise.all(
      normalized.properties.map(async (entry) => ({
        ...entry,
        coverImage: entry.coverImage
          ? await normalizeCoverImage(entry.coverImage, clientUrl)
          : entry.coverImage,
      }))
    );
    // Keep the top-level mirror in sync with the (possibly re-resolved) primary property.
    normalized.coverImage = normalized.properties[0]?.coverImage ?? normalized.coverImage;
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
