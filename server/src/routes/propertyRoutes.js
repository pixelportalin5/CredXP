const express = require("express");
const router = express.Router();
const {
  getProperties,
  getPropertiesByStatus,
  searchProperties,
  getPropertyById,
  createProperty,
} = require("../controllers/propertyController");

// Static routes must come before :id to avoid route conflict
router.get("/search", searchProperties);
router.get("/status/:status", getPropertiesByStatus);
router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", createProperty);

module.exports = router;
