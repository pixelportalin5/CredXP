const express = require("express");
const { createEnquiry, getSellerEnquiries } = require("../controllers/enquiryController");
const { protect, authorizeSeller } = require("../middleware/authMiddleware");
const { validateEnquiry } = require("../middleware/validateRequest");

const router = express.Router();

router.post("/", validateEnquiry, createEnquiry);
router.get("/seller", protect, authorizeSeller, getSellerEnquiries);

module.exports = router;
