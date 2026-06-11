#!/usr/bin/env node
/**
 * Validates Cloudinary configuration: connectivity, upload, delete, URL shape.
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { requireCloudinaryEnv, configureCloudinary, cloudinary } = require("../src/config/cloudinary");
const imageUploadService = require("../src/services/imageUploadService");

const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function main() {
  console.log("[validate-cloudinary] Checking environment...");
  requireCloudinaryEnv();
  configureCloudinary();

  console.log("[validate-cloudinary] Pinging Cloudinary API...");
  await cloudinary.api.ping();
  console.log("[validate-cloudinary] OK — API reachable");

  const buffer = Buffer.from(TINY_PNG_BASE64, "base64");
  console.log("[validate-cloudinary] Uploading test image...");
  const uploaded = await imageUploadService.uploadBuffer(buffer, "image/png", "property");
  console.log(`[validate-cloudinary] OK — uploaded publicId=${uploaded.publicId}`);

  if (!uploaded.imageUrl.includes("res.cloudinary.com/")) {
    throw new Error("Uploaded imageUrl is not a Cloudinary secure URL");
  }
  console.log(`[validate-cloudinary] OK — imageUrl=${uploaded.imageUrl}`);

  const derived = imageUploadService.extractPublicIdFromUrl(uploaded.imageUrl);
  if (derived !== uploaded.publicId) {
    throw new Error(`publicId mismatch: derived=${derived} uploaded=${uploaded.publicId}`);
  }
  console.log("[validate-cloudinary] OK — publicId extraction");

  console.log("[validate-cloudinary] Deleting test image...");
  await imageUploadService.deleteImage(uploaded.publicId);
  console.log("[validate-cloudinary] OK — delete succeeded");

  console.log("\n[validate-cloudinary] ALL CHECKS PASSED\n");
}

main().catch((error) => {
  console.error("\n[validate-cloudinary] FAILED");
  console.error(error.message || error);
  process.exit(1);
});
