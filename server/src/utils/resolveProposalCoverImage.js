const {
  uploadDataUrl,
  isBase64DataUrl,
  isCloudinaryUrl,
} = require("../services/imageUploadService");

async function resolveProposalCoverImage(raw) {
  if (!raw || typeof raw !== "string") return "";

  const value = raw.trim();
  if (!value) return "";

  if (isCloudinaryUrl(value) || /^https?:\/\//i.test(value)) {
    return value;
  }

  if (isBase64DataUrl(value)) {
    try {
      const { imageUrl } = await uploadDataUrl(value, "proposal");
      return imageUrl;
    } catch {
      return "";
    }
  }

  return "";
}

module.exports = {
  resolveProposalCoverImage,
};
