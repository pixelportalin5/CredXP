const express = require("express");
const router = express.Router();
const {
  getProperties,
  getPropertiesByStatus,
  searchProperties,
  getPropertyById,
  createProperty,
  getSellerProperties,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { optionalAuth, protect, authorizeSeller } = require("../middleware/authMiddleware");

// Static routes must come before :id to avoid route conflict
router.get("/search", searchProperties);
router.get("/status/:status", getPropertiesByStatus);
router.get("/seller/my-properties", protect, authorizeSeller, getSellerProperties);
router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", optionalAuth, createProperty);
router.put("/:id", protect, authorizeSeller, updateProperty);
router.delete("/:id", protect, authorizeSeller, deleteProperty);

module.exports = router;
