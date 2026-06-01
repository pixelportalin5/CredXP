const ApiError = require("../utils/ApiError");

const emailPattern = /^\S+@\S+\.\S+$/;

function requireFields(body, fields) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    throw new ApiError(400, `Missing required field(s): ${missing.join(", ")}`);
  }
}

const validateAuth = (mode) => (req, res, next) => {
  try {
    requireFields(req.body, mode === "register" ? ["name", "email", "password"] : ["email", "password"]);

    if (!emailPattern.test(req.body.email)) {
      throw new ApiError(400, "Please provide a valid email");
    }

    if (String(req.body.password).length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
    }

    if (mode === "register" && req.body.role && !["buyer", "seller"].includes(req.body.role)) {
      throw new ApiError(400, "Role must be buyer or seller");
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateEnquiry = (req, res, next) => {
  try {
    requireFields(req.body, ["customerName", "email"]);
    if (!req.body.propertyId && !req.body.coworkingSpaceId) {
      throw new ApiError(400, "Property or coworking space is required");
    }
    if (!emailPattern.test(req.body.email)) {
      throw new ApiError(400, "Please provide a valid email");
    }
    next();
  } catch (error) {
    next(error);
  }
};

const validateContactMessage = (req, res, next) => {
  try {
    requireFields(req.body, ["fullName", "email", "phone", "company", "enquiryType", "message"]);

    if (!emailPattern.test(req.body.email)) {
      throw new ApiError(400, "Please provide a valid email");
    }

    if (!/^\d{8,15}$/.test(String(req.body.phone))) {
      throw new ApiError(400, "Phone must contain 8 to 15 digits");
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateAuth,
  validateEnquiry,
  validateContactMessage,
};
