const sharp = require("sharp");

const THUMB_WIDTH = 720;
const THUMB_HEIGHT = 720;
const JPEG_QUALITY = 82;

function isCloudinaryUrl(value) {
  return typeof value === "string" && value.includes("res.cloudinary.com/");
}

function isStaticPath(value) {
  return (
    typeof value === "string" &&
    (value.startsWith("/") || /^https?:\/\//i.test(value) || isCloudinaryUrl(value))
  );
}

async function generateCoverImage(source) {
  if (!source || typeof source !== "string") return "";

  if (isStaticPath(source)) {
    return source;
  }

  if (!source.startsWith("data:image/")) {
    return source;
  }

  const base64 = source.split(",")[1];
  if (!base64) return source;

  try {
    const input = Buffer.from(base64, "base64");
    const output = await sharp(input)
      .rotate()
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${output.toString("base64")}`;
  } catch {
    return source;
  }
}

async function applyCoverImage(payload) {
  const next = { ...payload };

  if (Array.isArray(next.images) && next.images.length > 0) {
    next.coverImage = await generateCoverImage(next.images[0]);
    if (Array.isArray(next.imagePublicIds) && next.imagePublicIds[0]) {
      next.coverImagePublicId = next.imagePublicIds[0];
    } else if (isCloudinaryUrl(next.images[0])) {
      const { extractPublicIdFromUrl } = require("../services/imageUploadService");
      const derived = extractPublicIdFromUrl(next.images[0]);
      if (derived) next.coverImagePublicId = derived;
    }
  } else if (next.coverImage) {
    next.coverImage = await generateCoverImage(next.coverImage);
    if (next.coverImagePublicId) {
      // keep explicit value
    } else if (isCloudinaryUrl(next.coverImage)) {
      const { extractPublicIdFromUrl } = require("../services/imageUploadService");
      const derived = extractPublicIdFromUrl(next.coverImage);
      if (derived) next.coverImagePublicId = derived;
    }
  }

  return next;
}

module.exports = {
  generateCoverImage,
  applyCoverImage,
};
