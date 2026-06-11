const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

const emailPattern = /^\S+@\S+\.\S+$/;

const authService = {
  async register({ name, email, password, phone, avatar, role = "buyer" }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "Email is already registered");
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      avatar,
      role,
    });

    return {
      token: signToken(user),
      user: sanitizeUser(user),
    };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    return {
      token: signToken(user),
      user: sanitizeUser(user),
    };
  },

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return sanitizeUser(user);
  },

  async updateMe(userId, { name, email, phone, avatar, avatarPublicId }) {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      if (!emailPattern.test(String(email))) {
        throw new ApiError(400, "Please provide a valid email");
      }

      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new ApiError(409, "Email is already registered");
      }

      updates.email = email;
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

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return sanitizeUser(user);
  },

  async updatePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current password and new password are required");
    }

    if (String(newPassword).length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
    }

    const user = await User.findById(userId).select("+password");
    if (!user || !(await user.comparePassword(currentPassword))) {
      throw new ApiError(401, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return sanitizeUser(user);
  },
};

authService.list = async function list({ limit = 100 } = {}) {
  const users = await User.find().sort({ createdAt: -1 }).limit(limit);
  return users.map(sanitizeUser);
};

authService.getById = async function getById(id) {
  const user = await User.findById(id);
  return user ? sanitizeUser(user) : null;
};

authService.update = async function update(id, data) {
  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  return user ? sanitizeUser(user) : null;
};

authService.delete = async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) return null;
  return { id };
};

module.exports = authService;
