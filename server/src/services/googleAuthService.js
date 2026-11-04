/**
 * "Continue with Google" (Postgres only).
 *
 * The site gets an ID token from Google's account chooser and posts it here.
 * We check its signature against Google's public keys, then sign in the
 * account with that Google id or verified email, or create one.
 *
 * Environment: GOOGLE_CLIENT_ID (the OAuth Web client id, same as the site's
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID). Comma-separate several ids if needed.
 */

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { toApiUser } = require("../lib/prisma/mappers");
const { newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");

const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];

let cachedKeys = { keys: new Map(), expiresAt: 0 };

function clientIds() {
  return String(process.env.GOOGLE_CLIENT_ID || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

async function googlePublicKey(kid) {
  if (Date.now() > cachedKeys.expiresAt || !cachedKeys.keys.has(kid)) {
    const response = await fetch(GOOGLE_CERTS_URL, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new ApiError(502, "Could not reach Google. Please try again.");
    const { keys = [] } = await response.json();
    const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get("cache-control") || "")?.[1]) || 3600;
    cachedKeys = {
      keys: new Map(keys.map((jwk) => [jwk.kid, crypto.createPublicKey({ key: jwk, format: "jwk" })])),
      expiresAt: Date.now() + maxAge * 1000,
    };
  }
  const key = cachedKeys.keys.get(kid);
  if (!key) throw new ApiError(401, "Google sign-in failed. Please try again.");
  return key;
}

async function verifyGoogleIdToken(idToken) {
  const audience = clientIds();
  if (!audience.length) throw new ApiError(503, "Google sign-in is not set up yet.");

  const decoded = jwt.decode(String(idToken || ""), { complete: true });
  if (!decoded?.header?.kid) throw new ApiError(401, "Google sign-in failed. Please try again.");

  const key = await googlePublicKey(decoded.header.kid);
  try {
    return jwt.verify(idToken, key, { algorithms: ["RS256"], audience, issuer: GOOGLE_ISSUERS });
  } catch {
    throw new ApiError(401, "Google sign-in expired or is invalid. Please try again.");
  }
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new ApiError(500, "JWT_SECRET is not configured");
  return jwt.sign({ id: user.legacyMongoId, role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function sessionFor(user, isNew) {
  if (user.accountStatus && user.accountStatus !== "active") {
    throw new ApiError(403, "This account is not active. Please contact CredXP.");
  }
  return { token: signToken(user), user: toApiUser(user), isNew };
}

const googleAuthService = {
  isConfigured: () => clientIds().length > 0,

  async signIn(idToken, { role = "buyer" } = {}) {
    const claims = await verifyGoogleIdToken(idToken);
    const googleId = String(claims.sub || "");
    const email = String(claims.email || "").toLowerCase();
    if (!googleId || !email) throw new ApiError(401, "Google didn't share an email address.");
    if (claims.email_verified !== true && claims.email_verified !== "true") {
      throw new ApiError(401, "Please verify your Google email address first.");
    }

    const byGoogleId = await prisma.user.findUnique({ where: { googleId } });
    if (byGoogleId) return sessionFor(byGoogleId, false);

    // Same verified email as an existing account (email/password or WhatsApp): link and sign in.
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      const linked = await prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId, ...(byEmail.avatar ? {} : claims.picture ? { avatar: String(claims.picture) } : {}) },
      });
      return sessionFor(linked, false);
    }

    const name = String(claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(" ") || email.split("@")[0]).trim();
    // Google accounts have no password; store an unguessable hash so password login can't match.
    const password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
    const created = await prisma.user.create({
      data: {
        id: newUuid(),
        legacyMongoId: newLegacyMongoId(),
        name,
        email,
        password,
        googleId,
        avatar: claims.picture ? String(claims.picture) : null,
        role: role === "seller" ? "seller" : "buyer",
      },
    });
    return sessionFor(created, true);
  },
};

module.exports = googleAuthService;
