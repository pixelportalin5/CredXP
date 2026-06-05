const sharp = require("sharp");

const THUMB_WIDTH = 720;
const THUMB_HEIGHT = 720;
const JPEG_QUALITY = 82;

function isStaticPath(value) {
  return typeof value === "string" && (value.startsWith("/") || /^https?:\/\//i.test(value));
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
  } else if (next.coverImage) {
    next.coverImage = await generateCoverImage(next.coverImage);
  }

  return next;
}

module.exports = {
  generateCoverImage,
  applyCoverImage,
};
