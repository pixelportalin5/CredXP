const { mapZohoRecordToProperty, normalizeZohoPayload } = require("./zohoPropertyMapper");
const { uploadBuffer, isCloudinaryUrl } = require("./imageUploadService");
const propertyService = require("./propertyService");
const zohoCrm = require("./zohoCrmClient");

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
        // Files stored in Zoho need the API token to download.
        ...(await zohoCrm.authHeadersFor(url)),
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

const RECORD_ID_KEYS = ["id", "Id", "ID", "zohoId", "Zoho_Id", "Record_Id", "record_id"];

function recordIdOf(record) {
  for (const key of RECORD_ID_KEYS) {
    if (record?.[key]) return String(record[key]).trim();
  }
  return "";
}

/**
 * Create or update the website listing for one Zoho record.
 * @param {object} rawRecord Zoho record or webhook body.
 * @param {{ fetchFullRecord?: boolean }} options When the Zoho API is configured,
 *   fetch the full record by id first, so a webhook that sends only a few fields
 *   can't blank out the rest.
 */
async function upsertPropertyFromZoho(rawRecord, { fetchFullRecord = false } = {}) {
  let record = normalizeZohoPayload(rawRecord);

  if (fetchFullRecord && zohoCrm.isConfigured()) {
    const id = recordIdOf(record);
    if (id) {
      const full = await zohoCrm.getRecord(id);
      if (full) record = { ...record, ...full };
    }
  }

  const { zohoId, mapped, imageUrls } = mapZohoRecordToProperty(record);

  if (imageUrls.length > 0) {
    const imagePayload = await syncImagesFromUrls(imageUrls);
    if (imagePayload.images.length > 0) {
      mapped.images = imagePayload.images;
      mapped.coverImage = imagePayload.coverImage;
      mapped.imagePublicIds = imagePayload.imagePublicIds;
      mapped.coverImagePublicId = imagePayload.coverImagePublicId;
    }
  }

  return propertyService.upsertFromZoho(zohoId, mapped);
}

let lastImport = null;
let importRunning = false;

/**
 * Pull every record from the Zoho property module and upsert each one.
 * One bad record doesn't stop the rest; failures are listed in the result.
 */
async function importAllFromZoho({ trigger = "manual" } = {}) {
  if (!zohoCrm.isConfigured()) {
    const err = new Error(
      "Zoho API is not configured. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN on the server."
    );
    err.statusCode = 503;
    throw err;
  }
  if (importRunning) {
    const err = new Error("A Zoho import is already running");
    err.statusCode = 409;
    throw err;
  }

  importRunning = true;
  const startedAt = new Date();
  const summary = { trigger, startedAt, total: 0, created: 0, updated: 0, hidden: 0, failed: [] };

  try {
    const records = await zohoCrm.listAllRecords();
    summary.total = records.length;

    for (const record of records) {
      try {
        const { property, created } = await upsertPropertyFromZoho(record);
        if (created) summary.created += 1;
        else summary.updated += 1;
        if (property.listingStatus !== "published" || property.isActive === false) summary.hidden += 1;
      } catch (error) {
        summary.failed.push({
          zohoId: recordIdOf(record),
          name: record.Name || record.Property_Name || record.title || "",
          error: error.message,
        });
      }
    }
  } finally {
    importRunning = false;
    summary.finishedAt = new Date();
    lastImport = summary;
  }

  console.log(
    `[Zoho Import] ${trigger}: ${summary.total} records, ${summary.created} created, ` +
      `${summary.updated} updated, ${summary.failed.length} failed`
  );
  return summary;
}

function getSyncStatus() {
  const { module } = zohoCrm.getConfig();
  return {
    apiConfigured: zohoCrm.isConfigured(),
    webhookConfigured: Boolean(process.env.ZOHO_WEBHOOK_SECRET),
    module,
    scheduleMinutes: Number(process.env.ZOHO_SYNC_INTERVAL_MINUTES) || null,
    importRunning,
    lastImport,
  };
}

module.exports = {
  downloadImageToBuffer,
  syncImagesFromUrls,
  upsertPropertyFromZoho,
  importAllFromZoho,
  getSyncStatus,
};
