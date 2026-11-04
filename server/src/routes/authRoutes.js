const express = require("express");
const { register, login, me, updateMe, updatePassword, googleSignIn, sendOtp, verifyOtp, completeOtpSignup } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateAuth } = require("../middleware/validateRequest");

const router = express.Router();

// Each OTP costs a WhatsApp message: cap per visitor as well as per number.
const OTP_SENDS_PER_HOUR = 10;
const otpHits = new Map();
function limitOtpSends(req, res, next) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",").map((part) => part.trim()).filter(Boolean);
  const key = forwarded[forwarded.length - 1] || req.ip || "unknown";
  const now = Date.now();
  const recent = (otpHits.get(key) || []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= OTP_SENDS_PER_HOUR) {
    return res.status(429).json({ success: false, message: "Too many codes requested. Please try again later." });
  }
  recent.push(now);
  otpHits.set(key, recent);
  if (otpHits.size > 10000) otpHits.clear();
  return next();
}

router.post("/register", validateAuth("register"), register);
router.post("/login", validateAuth("login"), login);
router.post("/google", googleSignIn);
router.post("/otp/send", limitOtpSends, sendOtp);
router.post("/otp/verify", verifyOtp);
router.post("/otp/register", completeOtpSignup);
router.get("/me", protect, me);
router.patch("/me", protect, updateMe);
router.patch("/password", protect, updatePassword);

module.exports = router;
