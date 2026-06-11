const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const uploadController = require("../controllers/uploadController");
const imageUploadService = require("../services/imageUploadService");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: imageUploadService.MAX_IMAGE_BYTES },
  fileFilter(req, file, callback) {
    const mimetype = String(file.mimetype || "").toLowerCase();
    if (!imageUploadService.ALLOWED_MIME_TYPES.has(mimetype)) {
      return callback(new Error("Unsupported image type"));
    }
    return callback(null, true);
  },
});

router.post("/image", protect, upload.single("image"), uploadController.uploadImage);

module.exports = router;
