const User = require("../models/User");
const Property = require("../models/Property");
const Enquiry = require("../models/Enquiry");
const SavedProperty = require("../models/SavedProperty");
const AuditLog = require("../models/AuditLog");
const ApiError = require("../utils/ApiError");

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    accountStatus: user.accountStatus || "active",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function writeLog(actor, action, entityType, entityId, metadata = {}) {
  return AuditLog.create({
    actor: actor?._id,
    action,
    entityType,
    entityId,
    metadata,
  });
}

function buildTextQuery(q) {
  if (!q) return {};
  const search = { $regex: q, $options: "i" };
  return {
    $or: [
      { name: search },
      { email: search },
      { phone: search },
      { title: search },
      { customerName: search },
    ],
  };
}

const adminService = {
  async summary() {
    const [
      totalUsers,
      activeSellers,
      activeListings,
      openEnquiries,
      closedEnquiries,
      savedPropertyCount,
      missingImages,
      missingReraId,
      missingTenant,
      missingFinancials,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller", accountStatus: { $ne: "disabled" } }),
      Property.countDocuments({ isActive: { $ne: false }, listingStatus: "published" }),
      Enquiry.countDocuments({ status: { $ne: "closed" } }),
      Enquiry.countDocuments({ status: "closed" }),
      SavedProperty.countDocuments(),
      Property.countDocuments({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] }),
      Property.countDocuments({ $or: [{ reraId: { $exists: false } }, { reraId: "" }] }),
      Property.countDocuments({ $or: [{ "tenant.name": { $exists: false } }, { "tenant.name": "" }] }),
      Property.countDocuments({
        $or: [
          { financials: { $exists: false } },
          { "financials.rentalYield": { $exists: false } },
          { "financials.capRate": { $exists: false } },
        ],
      }),
    ]);

    return {
      metrics: {
        totalUsers,
        activeSellers,
        activeListings,
        openEnquiries,
        closedEnquiries,
        savedPropertyCount,
      },
      dataQuality: {
        missingImages,
        missingReraId,
        missingTenant,
        missingFinancials,
      },
    };
  },

  async listUsers({ q, role, accountStatus } = {}) {
    const query = { ...buildTextQuery(q) };
    if (role) query.role = role;
    if (accountStatus) query.accountStatus = accountStatus;
    const users = await User.find(query).sort({ createdAt: -1 }).limit(100);
    return users.map(publicUser);
  },

  async updateUser(actor, id, data) {
    const allowed = {};
    if (data.name !== undefined) allowed.name = data.name;
    if (data.phone !== undefined) allowed.phone = data.phone;
    if (data.role !== undefined) {
      if (!["buyer", "seller", "admin"].includes(data.role)) {
        throw new ApiError(400, "Invalid role");
      }
      allowed.role = data.role;
    }
    if (data.accountStatus !== undefined) {
      if (!["active", "disabled"].includes(data.accountStatus)) {
        throw new ApiError(400, "Invalid account status");
      }
      allowed.accountStatus = data.accountStatus;
    }

    const user = await User.findByIdAndUpdate(id, allowed, { new: true, runValidators: true });
    if (!user) throw new ApiError(404, "User not found");

    await writeLog(actor, "admin.user.update", "User", user._id, allowed);
    return publicUser(user);
  },

  async listEnquiries({ status, q } = {}) {
    const query = {};
    if (status) query.status = status;
    if (q) {
      const search = { $regex: q, $options: "i" };
      query.$or = [{ customerName: search }, { email: search }, { phone: search }, { message: search }];
    }

    return Enquiry.find(query)
      .populate("propertyId", "title type location price")
      .populate("coworkingSpaceId", "title operator location monthlySeatPrice priceLabel")
      .populate("sellerId", "name email phone role")
      .populate("userId", "name email phone role")
      .sort({ createdAt: -1 })
      .limit(150);
  },

  async updateEnquiryStatus(actor, id, status) {
    if (!["open", "closed"].includes(status)) {
      throw new ApiError(400, "Invalid enquiry status");
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      status === "closed" ? { status, closedAt: new Date() } : { status, $unset: { closedAt: "" } },
      { new: true }
    )
      .populate("propertyId", "title type location price")
      .populate("coworkingSpaceId", "title operator location monthlySeatPrice priceLabel")
      .populate("sellerId", "name email phone role")
      .populate("userId", "name email phone role");

    if (!enquiry) throw new ApiError(404, "Enquiry not found");

    await writeLog(actor, "admin.enquiry.status", "Enquiry", enquiry._id, { status });
    return enquiry;
  },

  async listLogs() {
    return AuditLog.find()
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(150);
  },

  async listProperties({ q, listingStatus } = {}) {
    const query = {};
    if (listingStatus) query.listingStatus = listingStatus;
    if (q) {
      const search = { $regex: q, $options: "i" };
      query.$or = [
        { title: search },
        { buildingName: search },
        { "location.city": search },
        { "tenant.name": search },
      ];
    }
    return Property.find(query).populate("seller", "name email role").sort({ createdAt: -1 }).limit(150);
  },

  async createProperty(actor, data) {
    const property = await Property.create({
      ...data,
      seller: undefined,
      isActive: data.isActive !== false,
      listingStatus: data.listingStatus || "published",
    });
    await writeLog(actor, "admin.property.create", "Property", property._id, { title: property.title });
    return property;
  },

  async updateProperty(actor, id, data) {
    const property = await Property.findById(id);
    if (!property) throw new ApiError(404, "Property not found");
    Object.assign(property, data);
    await property.save();
    await writeLog(actor, "admin.property.update", "Property", property._id, {
      title: property.title,
      listingStatus: property.listingStatus,
      featured: property.featured,
      isActive: property.isActive,
    });
    return property;
  },

  async deleteProperty(actor, id) {
    const property = await Property.findById(id);
    if (!property) throw new ApiError(404, "Property not found");
    await Enquiry.deleteMany({ propertyId: property._id });
    await property.deleteOne();
    await writeLog(actor, "admin.property.delete", "Property", property._id, { title: property.title });
    return { id };
  },
};

module.exports = adminService;
