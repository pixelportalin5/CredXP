const express = require("express");
const { spamGuard } = require("../middleware/spamGuard");
const { createContactMessage, subscribeNewsletter } = require("../controllers/contactController");
const { validateContactMessage } = require("../middleware/validateRequest");

const router = express.Router();

// Newsletter sign-ups email the team, so cap them per visitor: 5 an hour.
const NEWSLETTER_LIMIT = 5;
const NEWSLETTER_WINDOW_MS = 60 * 60 * 1000;
const newsletterHits = new Map();

function limitNewsletter(req, res, next) {
  const now = Date.now();
  // Behind Render's proxy req.ip is the proxy; the last forwarded entry is the one the proxy added.
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",").map((part) => part.trim()).filter(Boolean);
  const key = forwarded[forwarded.length - 1] || req.ip || "unknown";
  const recent = (newsletterHits.get(key) || []).filter((time) => now - time < NEWSLETTER_WINDOW_MS);
  if (recent.length >= NEWSLETTER_LIMIT) {
    return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
  }
  recent.push(now);
  newsletterHits.set(key, recent);
  if (newsletterHits.size > 10000) newsletterHits.clear();
  return next();
}

router.post("/", spamGuard, validateContactMessage, createContactMessage);
router.post("/newsletter", limitNewsletter, spamGuard, subscribeNewsletter);

module.exports = router;
