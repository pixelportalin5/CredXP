const crypto = require("crypto");

/**
 * Verifies Zoho webhook requests against ZOHO_WEBHOOK_SECRET, sent either as
 * the `x-zoho-webhook-secret` header or a `secret` URL parameter (Zoho's
 * webhook form makes URL parameters the easiest to set).
 */
function verifyZohoWebhookSecret(req, res, next) {
  const expected = process.env.ZOHO_WEBHOOK_SECRET;
  if (!expected) {
    return res.status(503).json({ success: false, message: "Zoho webhook is not configured" });
  }

  const provided = String(req.headers["x-zoho-webhook-secret"] || req.query.secret || "");
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(expected).digest();

  if (!provided || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  return next();
}

module.exports = { verifyZohoWebhookSecret };
