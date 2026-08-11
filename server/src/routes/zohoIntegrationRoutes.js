const express = require("express");
const router = express.Router();
const { verifyZohoWebhookSecret } = require("../middleware/zohoWebhookAuth");
const { handleZohoPropertyWebhook } = require("../controllers/zohoWebhookController");

router.post("/webhook", verifyZohoWebhookSecret, handleZohoPropertyWebhook);

module.exports = router;
