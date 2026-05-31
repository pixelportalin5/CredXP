const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  getProperties,
  getPropertiesByStatus,
  searchProperties,
  getPropertyById,
  createProperty,
  downloadBulkTemplate,
  bulkUploadProperties,
  getSellerProperties,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { optionalAuth, protect, authorizeSeller } = require("../middleware/authMiddleware");
const ApiError = require("../utils/ApiError");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const isExcel = file.fieldname === "excel" && /\.xlsx$/i.test(file.originalname);
    const isZip = file.fieldname === "imagesZip" && /\.zip$/i.test(file.originalname);

    if (!isExcel && !isZip) {
      return cb(new ApiError(400, "Only .xlsx and .zip files are allowed"));
    }

    cb(null, true);
  },
});

// Static routes must come before :id to avoid route conflict
router.get("/bulk/template", protect, authorizeSeller, downloadBulkTemplate);
router.post(
  "/bulk/upload",
  protect,
  authorizeSeller,
  upload.fields([
    { name: "excel", maxCount: 1 },
    { name: "imagesZip", maxCount: 1 },
  ]),
  bulkUploadProperties
);
router.get("/search", searchProperties);
router.get("/status/:status", getPropertiesByStatus);
router.get("/seller/my-properties", protect, authorizeSeller, getSellerProperties);
router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", optionalAuth, createProperty);
router.put("/:id", protect, authorizeSeller, updateProperty);
router.delete("/:id", protect, authorizeSeller, deleteProperty);

module.exports = router;
