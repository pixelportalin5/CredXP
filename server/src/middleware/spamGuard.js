/**
 * Stops bot form fills on public forms (inquiry, contact, newsletter).
 *
 * Bots get a normal-looking success response, but nothing is saved or emailed,
 * so they have no signal to adapt to. Checks:
 *  1. Honeypot: a hidden "website" field (body._hp) that people never see or fill.
 *  2. Timing: the page sends when the form was opened (body._t); under 3 seconds is a bot.
 *  3. Gibberish: random strings like "cEeQhGreDmOeCqjuy" or names with no vowels.
 *  4. Rate limit: at most 8 submissions an hour per visitor.
 */

const MIN_FILL_MS = 3000;
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map();

function clientKey(req) {
  // Behind Render's proxy req.ip is the proxy; the last forwarded entry is the one the proxy added.
  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return forwarded[forwarded.length - 1] || req.ip || "unknown";
}

function rateLimited(req) {
  const now = Date.now();
  const key = clientKey(req);
  const recent = (hits.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10000) hits.clear();
  return recent.length > RATE_LIMIT;
}

/** A single word of 10+ letters with 3+ capitals after the first letter: "XsahcVGZTrSjcKlxWlhet". */
function isRandomCaseString(value) {
  const text = String(value || "").trim();
  if (!/^[A-Za-z]{10,}$/.test(text)) return false;
  const innerCaps = (text.slice(1).match(/[A-Z]/g) || []).length;
  return innerCaps >= 3;
}

/** Every word of the name is 4+ letters with no vowel: "Htpvc Jmydv". */
function isVowellessName(value) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((word) => /^[A-Za-z]{4,}$/.test(word) && !/[aeiouy]/i.test(word));
}

/** Gmail addresses padded with dots, a common bot pattern: "j.uhic.aba.5.5.6@gmail.com". */
function isDottedGmail(email) {
  const [local, domain] = String(email || "").toLowerCase().split("@");
  return /^(gmail|googlemail)\.com$/.test(domain || "") && (local.match(/\./g) || []).length >= 4;
}

function spamReason(body = {}) {
  if (body._hp && String(body._hp).trim()) return "honeypot";

  const startedAt = Number(body._t);
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) return "too fast";

  const name = body.customerName ?? body.fullName;
  const textFields = [name, body.message, body.company];
  if (textFields.some(isRandomCaseString)) return "random text";
  if (name && isVowellessName(name)) return "random name";
  if (isDottedGmail(body.email) && (textFields.some(isRandomCaseString) || /^[A-Za-z]{8,}$/.test(String(body.message || "")))) {
    return "bot email";
  }
  return null;
}

function stripGuardFields(body) {
  if (body && typeof body === "object") {
    delete body._hp;
    delete body._t;
  }
}

/** Express middleware. Put it before validation on public form routes. */
function spamGuard(req, res, next) {
  if (rateLimited(req)) {
    return res.status(429).json({ success: false, message: "Too many submissions. Please try again later." });
  }
  const reason = spamReason(req.body);
  if (reason) {
    console.warn(`[Spam guard] Dropped ${req.originalUrl} submission (${reason}) from ${clientKey(req)}`);
    return res.status(201).json({ success: true, data: {} });
  }
  stripGuardFields(req.body);
  return next();
}

module.exports = { spamGuard, spamReason, isRandomCaseString, isVowellessName, isDottedGmail };
