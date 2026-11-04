/**
 * Sends a login code on WhatsApp through BhashSMS, using an approved OTP template.
 *
 * Environment:
 *   BHASH_USER, BHASH_PASS   BhashSMS account login (required)
 *   BHASH_OTP_TEMPLATE       approved WhatsApp template name (required)
 *   BHASH_WA_SENDER          WhatsApp sender id (default BUZWAP)
 *   BHASH_OTP_STYPE          message type: auth for OTP/authentication templates (default),
 *                            normal for utility templates
 *   BHASH_PHONE_FORMAT       10 = send 9876543210 (default), 91 = send 919876543210
 *   BHASH_API_URL            default https://bhashsms.com/api/sendmsg.php
 *
 * Without BHASH_* outside production, the code is printed to the server log instead.
 */

const REQUEST_TIMEOUT_MS = 15000;

function config() {
  return {
    user: process.env.BHASH_USER?.trim(),
    pass: process.env.BHASH_PASS?.trim(),
    template: process.env.BHASH_OTP_TEMPLATE?.trim(),
    sender: process.env.BHASH_WA_SENDER?.trim() || "BUZWAP",
    stype: process.env.BHASH_OTP_STYPE?.trim() || "auth",
    phoneFormat: process.env.BHASH_PHONE_FORMAT?.trim() === "91" ? "91" : "10",
    apiUrl: process.env.BHASH_API_URL?.trim() || "https://bhashsms.com/api/sendmsg.php",
  };
}

function isConfigured() {
  const { user, pass, template } = config();
  return Boolean(user && pass && template);
}

/** BhashSMS answers in plain text; failures read like "Invalid ..." or "Error ...". */
function looksLikeFailure(body) {
  return /invalid|error|fail|insufficient|not\s+(allowed|approved|registered)|wrong|denied/i.test(body);
}

/**
 * @param {string} phone  91XXXXXXXXXX
 * @param {string} code   the one-time code (the template's only variable)
 */
async function sendOtp(phone, code) {
  if (!isConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw Object.assign(new Error("WhatsApp OTP is not set up yet. Please log in with email and password."), {
        statusCode: 503,
      });
    }
    console.log(`[WhatsApp OTP] (dev, not sent) code for ${phone}: ${code}`);
    return { dev: true };
  }

  const { user, pass, template, sender, stype, phoneFormat, apiUrl } = config();
  const url = new URL(apiUrl);
  url.search = new URLSearchParams({
    user,
    pass,
    sender,
    phone: phoneFormat === "91" ? phone : phone.slice(-10),
    text: template,
    priority: "wa",
    stype,
    Params: code,
  }).toString();

  let body = "";
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    body = (await response.text()).trim();
    if (!response.ok || looksLikeFailure(body)) {
      throw new Error(`BhashSMS ${response.status}: ${body.slice(0, 200)}`);
    }
  } catch (error) {
    // Never log the URL: it carries the account password.
    console.error(`[WhatsApp OTP] Send to ${phone.slice(0, 4)}******${phone.slice(-2)} failed: ${error.message}`);
    throw Object.assign(new Error("Could not send the WhatsApp code. Please try again in a minute."), {
      statusCode: 502,
    });
  }
  return { providerResponse: body.slice(0, 100) };
}

module.exports = { sendOtp, isConfigured };
