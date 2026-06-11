const ApiError = require("../utils/ApiError");
const imageUploadService = require("../services/imageUploadService");

async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      throw new ApiError(400, "Image file is required");
    }

    const category = String(req.body.category || "property").toLowerCase();
    if (!imageUploadService.isValidCategory(category)) {
      throw new ApiError(
        400,
        `Invalid category. Allowed: ${Object.keys(imageUploadService.IMAGE_CATEGORIES).join(", ")}`
      );
    }

    const replacePublicId = req.body.replacePublicId
      ? String(req.body.replacePublicId).trim()
      : undefined;

    const result = replacePublicId
      ? await imageUploadService.replaceImage(
          req.file.buffer,
          req.file.mimetype,
          category,
          replacePublicId
        )
      : await imageUploadService.uploadBuffer(req.file.buffer, req.file.mimetype, category);

    res.json({
      success: true,
      imageUrl: result.imageUrl,
      publicId: result.publicId,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadImage,
};
