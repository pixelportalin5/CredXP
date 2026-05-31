const express = require("express");
const {
  createEnquiry,
  getSellerEnquiries,
  getMyEnquiries,
  archiveMyEnquiry,
  clearMyEnquiries,
  closeSellerEnquiry,
} = require("../controllers/enquiryController");
const { optionalAuth, protect, authorizeSeller } = require("../middleware/authMiddleware");
const { validateEnquiry } = require("../middleware/validateRequest");

const router = express.Router();

router.post("/", optionalAuth, validateEnquiry, createEnquiry);
router.get("/seller", protect, authorizeSeller, getSellerEnquiries);
router.patch("/seller/:enquiryId/close", protect, authorizeSeller, closeSellerEnquiry);
router.get("/me", protect, getMyEnquiries);
router.delete("/me", protect, clearMyEnquiries);
router.delete("/me/:enquiryId", protect, archiveMyEnquiry);

module.exports = router;
