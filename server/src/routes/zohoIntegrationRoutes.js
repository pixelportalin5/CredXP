const express = require("express");
const router = express.Router();
const { verifyZohoWebhookSecret } = require("../middleware/zohoWebhookAuth");
const { protect, authorizeAdmin } = require("../middleware/authMiddleware");
const {
  handleZohoPropertyWebhook,
  importFromZoho,
  zohoSyncStatus,
} = require("../controllers/zohoWebhookController");

router.post("/webhook", verifyZohoWebhookSecret, handleZohoPropertyWebhook);
router.post("/import", protect, authorizeAdmin, importFromZoho);
router.get("/status", protect, authorizeAdmin, zohoSyncStatus);

module.exports = router;
