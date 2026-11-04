/**
 * Login and sign-up with a WhatsApp one-time code (Postgres only).
 *
 * Flow:
 *   1. sendCode(phone)              → 6-digit code on WhatsApp, valid 5 minutes
 *   2. verifyCode(phone, code)      → existing account: { token, user }
 *                                     new number:       { needsSignup: true, signupToken }
 *   3. completeSignup(signupToken, { name, email, role }) → { token, user }
 */

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { toApiUser } = require("../lib/prisma/mappers");
const { newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");
const { sendOtp } = require("./whatsappOtpSender");

const CODE_TTL_MS = 5 * 60 * 1000;
const RESEND_AFTER_MS = 30 * 1000;
const MAX_CODES_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;
const SIGNUP_TOKEN_TTL = "20m";
const emailPattern = /^\S+@\S+\.\S+$/;

/** Indian mobile → 91XXXXXXXXXX. Accepts +91, 91, 0 prefixes, spaces and dashes. */
function normalizePhone(input) {
  let digits = String(input || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw new ApiError(400, "Please enter a valid 10-digit Indian mobile number");
  }
  return `91${digits}`;
}

/** 919876543210 → "+91 98765 43210" */
function displayPhone(phone) {
  return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
}

function hashCode(phone, code) {
  const secret = process.env.JWT_SECRET || "";
  return crypto.createHmac("sha256", secret).update(`${phone}:${code}`).digest("hex");
}

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new ApiError(500, "JWT_SECRET is not configured");
  return secret;
}

function signToken(user) {
  return jwt.sign({ id: user.legacyMongoId, role: user.role }, jwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function sessionFor(user) {
  if (user.accountStatus && user.accountStatus !== "active") {
    throw new ApiError(403, "This account is not active. Please contact CredXP.");
  }
  return { token: signToken(user), user: toApiUser(user) };
}

const otpAuthService = {
  normalizePhone,

  async sendCode(rawPhone) {
    const phone = normalizePhone(rawPhone);
    const now = Date.now();

    const recent = await prisma.otpCode.findMany({
      where: { phone, createdAt: { gte: new Date(now - 60 * 60 * 1000) } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_AFTER_MS) {
      const wait = Math.ceil((RESEND_AFTER_MS - (now - recent[0].createdAt.getTime())) / 1000);
      throw new ApiError(429, `Please wait ${wait} seconds before asking for a new code`);
    }
    if (recent.length >= MAX_CODES_PER_HOUR) {
      throw new ApiError(429, "Too many codes requested for this number. Please try again in an hour.");
    }

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    // Only the latest code works: retire earlier unused ones.
    await prisma.otpCode.updateMany({ where: { phone, usedAt: null }, data: { usedAt: new Date() } });
    const record = await prisma.otpCode.create({
      data: { id: newUuid(), phone, codeHash: hashCode(phone, code), expiresAt: new Date(now + CODE_TTL_MS) },
    });

    try {
      await sendOtp(phone, code);
    } catch (error) {
      await prisma.otpCode.delete({ where: { id: record.id } }).catch(() => {});
      throw error;
    }

    // Clean up old codes now and then.
    if (Math.random() < 0.05) {
      void prisma.otpCode.deleteMany({ where: { createdAt: { lt: new Date(now - 24 * 60 * 60 * 1000) } } }).catch(() => {});
    }

    return { phone: displayPhone(phone), expiresInSeconds: CODE_TTL_MS / 1000, resendAfterSeconds: RESEND_AFTER_MS / 1000 };
  },

  async verifyCode(rawPhone, rawCode) {
    const phone = normalizePhone(rawPhone);
    const code = String(rawCode || "").replace(/\D/g, "");
    if (code.length !== 6) throw new ApiError(400, "Enter the 6-digit code from WhatsApp");

    const record = await prisma.otpCode.findFirst({
      where: { phone, usedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new ApiError(400, "This code has expired. Please ask for a new one.");
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      throw new ApiError(429, "Too many wrong attempts. Please ask for a new code.");
    }

    const expected = Buffer.from(record.codeHash, "hex");
    const actual = Buffer.from(hashCode(phone, code), "hex");
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      const left = MAX_ATTEMPTS - record.attempts - 1;
      throw new ApiError(400, left > 0 ? `Wrong code. ${left} ${left === 1 ? "try" : "tries"} left.` : "Wrong code. Please ask for a new one.");
    }

    await prisma.otpCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });

    const user = await prisma.user.findUnique({ where: { phoneVerified: phone } });
    if (user) return sessionFor(user);

    const signupToken = jwt.sign({ purpose: "otp-signup", phone }, jwtSecret(), { expiresIn: SIGNUP_TOKEN_TTL });
    return { needsSignup: true, signupToken, phone: displayPhone(phone) };
  },

  async completeSignup(signupToken, { name, email, role = "buyer" } = {}) {
    let payload;
    try {
      payload = jwt.verify(String(signupToken || ""), jwtSecret());
    } catch {
      throw new ApiError(401, "Your verification expired. Please verify your number again.");
    }
    if (payload?.purpose !== "otp-signup" || !payload.phone) {
      throw new ApiError(401, "Please verify your number again.");
    }

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (cleanName.length < 2) throw new ApiError(400, "Please enter your name");
    if (!emailPattern.test(cleanEmail)) throw new ApiError(400, "Please provide a valid email");
    if (!["buyer", "seller"].includes(role)) throw new ApiError(400, "Role must be buyer or seller");

    const phone = payload.phone;
    const existingPhone = await prisma.user.findUnique({ where: { phoneVerified: phone } });
    if (existingPhone) return sessionFor(existingPhone);

    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      throw new ApiError(409, "This email already has a CredXP account. Log in with email and password instead.");
    }

    // OTP accounts have no password; store an unguessable hash so password login can't match.
    const password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
    const user = await prisma.user.create({
      data: {
        id: newUuid(),
        legacyMongoId: newLegacyMongoId(),
        name: cleanName,
        email: cleanEmail,
        password,
        phone: `+${phone}`,
        phoneVerified: phone,
        role,
      },
    });
    return sessionFor(user);
  },
};

module.exports = otpAuthService;
