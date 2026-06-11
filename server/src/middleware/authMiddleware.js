const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const { resolveAuthUser } = require("../lib/resolveAuthUser");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await resolveAuthUser(decoded.id);
    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }
    if (user.accountStatus === "disabled") {
      throw new ApiError(403, "Account is disabled");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Invalid or expired token"));
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await resolveAuthUser(decoded.id);
    if (user?.accountStatus === "disabled") {
      throw new ApiError(403, "Account is disabled");
    }
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};

const authorizeSeller = (req, res, next) => {
  if (!req.user || !["seller", "admin"].includes(req.user.role)) {
    return next(new ApiError(403, "Seller access required"));
  }
  next();
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError(403, "Admin access required"));
  }
  next();
};

const authorizeEmployee = (req, res, next) => {
  if (!req.user || req.user.role !== "employee") {
    return next(new ApiError(403, "Employee access required"));
  }
  next();
};

const authorizeStaff = (req, res, next) => {
  if (!req.user || !["admin", "employee"].includes(req.user.role)) {
    return next(new ApiError(403, "Staff access required"));
  }
  next();
};

const isStaffRole = (role) => ["admin", "employee"].includes(role);

module.exports = {
  protect,
  optionalAuth,
  authorizeSeller,
  authorizeAdmin,
  authorizeEmployee,
  authorizeStaff,
  isStaffRole,
};
