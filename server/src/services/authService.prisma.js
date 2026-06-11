const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const { findUser } = require("../lib/prisma/resolveEntity");
const { toApiUser } = require("../lib/prisma/mappers");
const { newLegacyMongoId, newUuid } = require("../lib/prisma/legacyId");

function sanitizeUser(user) {
  return toApiUser(user);
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new ApiError(500, "JWT_SECRET is not configured");

  return jwt.sign(
    { id: user.legacyMongoId, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

const emailPattern = /^\S+@\S+\.\S+$/;

const authService = {
  async register({ name, email, password, phone, avatar, role = "buyer" }) {
    const existingUser = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (existingUser) throw new ApiError(409, "Email is already registered");

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        id: newUuid(),
        legacyMongoId: newLegacyMongoId(),
        name,
        email: String(email).toLowerCase(),
        password: hashed,
        phone: phone || null,
        avatar: avatar || null,
        role,
      },
    });

    return { token: signToken(user), user: sanitizeUser(user) };
  },

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    return { token: signToken(user), user: sanitizeUser(user) };
  },

  async getMe(userId) {
    const user = await findUser(userId);
    if (!user) throw new ApiError(404, "User not found");
    return sanitizeUser(user);
  },

  async updateMe(userId, { name, email, phone, avatar, avatarPublicId }) {
    const user = await findUser(userId);
    if (!user) throw new ApiError(404, "User not found");

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      if (!emailPattern.test(String(email))) throw new ApiError(400, "Please provide a valid email");
      const existingUser = await prisma.user.findFirst({
        where: { email: String(email).toLowerCase(), NOT: { id: user.id } },
      });
      if (existingUser) throw new ApiError(409, "Email is already registered");
      updates.email = String(email).toLowerCase();
    }
    if (phone !== undefined) updates.phone = phone;
    if (phone && !/^\d{8,15}$/.test(String(phone))) {
      throw new ApiError(400, "Phone must contain 8 to 15 digits");
    }
    if (avatar !== undefined) {
      if (avatar === "" || avatar === null) {
        updates.avatar = "";
        updates.avatarPublicId = "";
      } else {
        const value = String(avatar);
        const isDataUrl = value.startsWith("data:image/");
        const isHttpUrl = /^https?:\/\//i.test(value);
        if (!isDataUrl && !isHttpUrl) {
          throw new ApiError(400, "Avatar must be an image data URL or http(s) URL");
        }
        if (isDataUrl && value.length > 512000) {
          throw new ApiError(400, "Avatar image is too large");
        }
        updates.avatar = value;
        if (avatarPublicId !== undefined) {
          updates.avatarPublicId = String(avatarPublicId || "");
        } else if (value.includes("res.cloudinary.com/")) {
          const { extractPublicIdFromUrl } = require("./imageUploadService");
          const derived = extractPublicIdFromUrl(value);
          if (derived) updates.avatarPublicId = derived;
        }
      }
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data: updates });
    return sanitizeUser(updated);
  },

  async updatePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current password and new password are required");
    }
    if (String(newPassword).length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
    }

    const user = await findUser(userId);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new ApiError(401, "Current password is incorrect");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 12) },
    });

    return sanitizeUser(updated);
  },

  async list({ limit = 100 } = {}) {
    const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: limit });
    return rows.map(sanitizeUser);
  },

  async getById(id) {
    const user = await findUser(id);
    return sanitizeUser(user);
  },

  async update(id, data) {
    const user = await findUser(id);
    if (!user) return null;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name ?? user.name,
        phone: data.phone ?? user.phone,
        role: data.role ?? user.role,
        accountStatus: data.accountStatus ?? user.accountStatus,
      },
    });
    return sanitizeUser(updated);
  },

  async delete(id) {
    const user = await findUser(id);
    if (!user) return null;
    await prisma.user.delete({ where: { id: user.id } });
    return { id: user.legacyMongoId };
  },
};

module.exports = authService;
