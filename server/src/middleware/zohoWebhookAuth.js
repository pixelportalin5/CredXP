/**
 * Verifies Zoho webhook requests via the `x-zoho-webhook-secret` header.
 * Local test secret (exact match required).
 */
const ZOHO_WEBHOOK_SECRET = "credxp_local_test_123";

function verifyZohoWebhookSecret(req, res, next) {
  const provided = req.headers["x-zoho-webhook-secret"];

  if (provided !== ZOHO_WEBHOOK_SECRET) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  return next();
}

module.exports = { verifyZohoWebhookSecret, ZOHO_WEBHOOK_SECRET };
