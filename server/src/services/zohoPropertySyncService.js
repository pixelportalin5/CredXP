const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const { mapZohoRecordToProperty } = require("./zohoPropertyMapper");
const { uploadBuffer, isCloudinaryUrl } = require("./imageUploadService");
const { invalidatePrefix } = require("../utils/queryCache");

const IMAGE_DOWNLOAD_TIMEOUT_MS = 20000;
const MAX_IMAGES = 10;

function guessMimeFromContentType(contentType, url) {
  const type = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (type.startsWith("image/")) return type;

  const lowerUrl = String(url || "").toLowerCase();
  if (lowerUrl.includes(".png")) return "image/png";
  if (lowerUrl.includes(".webp")) return "image/webp";
  if (lowerUrl.includes(".gif")) return "image/gif";
  if (lowerUrl.includes(".avif")) return "image/avif";
  return "image/jpeg";
}

/**
 * Download a remote image URL into a buffer for Cloudinary upload.
 */
async function downloadImageToBuffer(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "image/*,*/*",
        "User-Agent": "CredXP-Zoho-Sync/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download image (${response.status})`);
    }

    const contentType = response.headers.get("content-type") || "";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      mimetype: guessMimeFromContentType(contentType, url),
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve Zoho image URLs into Cloudinary URLs + publicIds.
 * Already-Cloudinary URLs are kept as-is.
 */
async function syncImagesFromUrls(imageUrls = []) {
  const uniqueUrls = [...new Set(imageUrls.filter(Boolean))].slice(0, MAX_IMAGES);
  if (uniqueUrls.length === 0) {
    return { images: [], imagePublicIds: [], coverImage: "", coverImagePublicId: "" };
  }

  const images = [];
  const imagePublicIds = [];

  for (const url of uniqueUrls) {
    try {
      if (isCloudinaryUrl(url)) {
        images.push(url);
        continue;
      }

      const { buffer, mimetype } = await downloadImageToBuffer(url);
      const uploaded = await uploadBuffer(buffer, mimetype, "property");
      images.push(uploaded.imageUrl);
      imagePublicIds.push(uploaded.publicId);
    } catch (error) {
      console.error(`[Zoho Sync] Skipping image ${url}: ${error.message}`);
    }
  }

  return {
    images,
    imagePublicIds,
    coverImage: images[0] || "",
    coverImagePublicId: imagePublicIds[0] || "",
  };
}

/**
 * Upsert a CredXP Property from a Zoho webhook payload.
 */
async function upsertPropertyFromZoho(rawBody) {
  const { zohoId, mapped, imageUrls } = mapZohoRecordToProperty(rawBody);

  if (imageUrls.length > 0) {
    const imagePayload = await syncImagesFromUrls(imageUrls);
    if (imagePayload.images.length > 0) {
      mapped.images = imagePayload.images;
      mapped.coverImage = imagePayload.coverImage;
      if (imagePayload.imagePublicIds.length > 0) {
        mapped.imagePublicIds = imagePayload.imagePublicIds;
        mapped.coverImagePublicId = imagePayload.coverImagePublicId;
      }
    }
  }

  mapped.zohoId = zohoId;
  mapped.zohoLastSync = new Date();

  const property = await Property.findOneAndUpdate(
    { zohoId },
    { $set: mapped },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  if (!property) {
    throw new ApiError(500, "Failed to upsert property from Zoho payload");
  }

  invalidatePrefix("properties");

  return property;
}

module.exports = {
  downloadImageToBuffer,
  syncImagesFromUrls,
  upsertPropertyFromZoho,
};
