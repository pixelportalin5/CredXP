const { Readable } = require("stream");
const { cloudinary, configureCloudinary } = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");

const IMAGE_CATEGORIES = {
  property: "credxp/properties",
  coworking: "credxp/coworking",
  avatar: "credxp/avatars",
  proposal: "credxp/proposals",
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function isValidCategory(category) {
  return Object.prototype.hasOwnProperty.call(IMAGE_CATEGORIES, category);
}

function isBase64DataUrl(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function isCloudinaryUrl(value) {
  return typeof value === "string" && value.includes("res.cloudinary.com/");
}

function isAlreadyMigrated(value) {
  return isCloudinaryUrl(value);
}

function validateImageBuffer(buffer, mimetype) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new ApiError(400, "Image file is empty");
  }

  const normalizedMime = String(mimetype || "").toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    throw new ApiError(
      400,
      "Unsupported image type. Allowed: JPEG, PNG, WebP, GIF, AVIF"
    );
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new ApiError(400, `Image exceeds maximum size of ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`);
  }
}

function uploadStream(buffer, options) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    Readable.from(buffer).pipe(upload);
  });
}

function toUploadResult(result) {
  return {
    imageUrl: result.secure_url,
    publicId: result.public_id,
  };
}

async function uploadBuffer(buffer, mimetype, category = "property") {
  if (!isValidCategory(category)) {
    throw new ApiError(400, `Invalid image category. Allowed: ${Object.keys(IMAGE_CATEGORIES).join(", ")}`);
  }

  configureCloudinary();
  validateImageBuffer(buffer, mimetype);

  const result = await uploadStream(buffer, {
    folder: IMAGE_CATEGORIES[category],
    resource_type: "image",
  });

  return toUploadResult(result);
}

async function uploadDataUrl(dataUrl, category = "property") {
  if (!isBase64DataUrl(dataUrl)) {
    throw new ApiError(400, "Value is not a base64 image data URL");
  }

  configureCloudinary();

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: IMAGE_CATEGORIES[category],
    resource_type: "image",
  });

  return toUploadResult(result);
}

async function deleteImage(publicId) {
  if (!publicId || typeof publicId !== "string") {
    throw new ApiError(400, "publicId is required to delete an image");
  }

  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  return { success: true, publicId };
}

async function replaceImage(buffer, mimetype, category, replacePublicId) {
  const uploaded = await uploadBuffer(buffer, mimetype, category);

  if (replacePublicId) {
    try {
      await deleteImage(replacePublicId);
    } catch {
      // Replacement succeeded; old asset cleanup is best-effort.
    }
  }

  return uploaded;
}

function extractPublicIdFromUrl(url) {
  if (!isCloudinaryUrl(url)) return null;

  try {
    const withoutQuery = url.split("?")[0];
    const uploadIndex = withoutQuery.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const pathAfterUpload = withoutQuery.slice(uploadIndex + "/upload/".length);
    const parts = pathAfterUpload.split("/");

    // Strip version segment (v1234567890) when present.
    const startIndex = parts[0]?.startsWith("v") && /^\d+$/.test(parts[0].slice(1)) ? 1 : 0;
    const publicIdWithExt = parts.slice(startIndex).join("/");
    if (!publicIdWithExt) return null;

    return publicIdWithExt.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

module.exports = {
  IMAGE_CATEGORIES,
  ALLOWED_MIME_TYPES,
  MAX_IMAGE_BYTES,
  isValidCategory,
  isBase64DataUrl,
  isCloudinaryUrl,
  isAlreadyMigrated,
  validateImageBuffer,
  uploadBuffer,
  uploadDataUrl,
  deleteImage,
  replaceImage,
  extractPublicIdFromUrl,
};
