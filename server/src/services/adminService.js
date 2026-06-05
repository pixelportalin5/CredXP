const User = require("../models/User");
const Property = require("../models/Property");
const Enquiry = require("../models/Enquiry");
const SavedProperty = require("../models/SavedProperty");
const AuditLog = require("../models/AuditLog");
const coworkingService = require("./coworkingService");
const { applyCoverImage } = require("../utils/imageThumbnail");
const { invalidatePrefix } = require("../utils/queryCache");
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
    const facetCount = (count) => count[0]?.count || 0;

    const [userCounts, enquiryCounts, savedPropertyCount, propertyCounts] = await Promise.all([
      User.aggregate([
        {
          $facet: {
            totalUsers: [{ $count: "count" }],
            activeSellers: [
              { $match: { role: "seller", accountStatus: { $ne: "disabled" } } },
              { $count: "count" },
            ],
          },
        },
      ]),
      Enquiry.aggregate([
        {
          $facet: {
            openEnquiries: [{ $match: { status: { $ne: "closed" } } }, { $count: "count" }],
            closedEnquiries: [{ $match: { status: "closed" } }, { $count: "count" }],
          },
        },
      ]),
      SavedProperty.countDocuments(),
      Property.aggregate([
        {
          $facet: {
            activeListings: [
              { $match: { isActive: { $ne: false }, listingStatus: "published" } },
              { $count: "count" },
            ],
            missingImages: [
              { $match: { $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] } },
              { $count: "count" },
            ],
            missingReraId: [
              { $match: { $or: [{ reraId: { $exists: false } }, { reraId: "" }] } },
              { $count: "count" },
            ],
            missingTenant: [
              { $match: { $or: [{ "tenant.name": { $exists: false } }, { "tenant.name": "" }] } },
              { $count: "count" },
            ],
            missingFinancials: [
              {
                $match: {
                  $or: [
                    { financials: { $exists: false } },
                    { "financials.rentalYield": { $exists: false } },
                    { "financials.capRate": { $exists: false } },
                  ],
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),
    ]);

    const users = userCounts[0] || {};
    const enquiries = enquiryCounts[0] || {};
    const properties = propertyCounts[0] || {};

    return {
      metrics: {
        totalUsers: facetCount(users.totalUsers),
        activeSellers: facetCount(users.activeSellers),
        activeListings: facetCount(properties.activeListings),
        openEnquiries: facetCount(enquiries.openEnquiries),
        closedEnquiries: facetCount(enquiries.closedEnquiries),
        savedPropertyCount,
      },
      dataQuality: {
        missingImages: facetCount(properties.missingImages),
        missingReraId: facetCount(properties.missingReraId),
        missingTenant: facetCount(properties.missingTenant),
        missingFinancials: facetCount(properties.missingFinancials),
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
    return Property.find(query)
      .select("-images")
      .populate("seller", "name email role")
      .sort({ createdAt: -1 })
      .limit(150);
  },

  async createProperty(actor, data) {
    const payload = await applyCoverImage({
      ...data,
      seller: undefined,
      isActive: data.isActive !== false,
      listingStatus: data.listingStatus || "published",
    });
    const property = await Property.create(payload);
    invalidatePrefix("properties");
    await writeLog(actor, "admin.property.create", "Property", property._id, { title: property.title });
    return property;
  },

  async updateProperty(actor, id, data) {
    const property = await Property.findById(id);
    if (!property) throw new ApiError(404, "Property not found");
    const nextData = data.images ? await applyCoverImage(data) : data;
    Object.assign(property, nextData);
    await property.save();
    invalidatePrefix("properties");
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
    invalidatePrefix("properties");
    await writeLog(actor, "admin.property.delete", "Property", property._id, { title: property.title });
    return { id };
  },

  async listCoworkingSpaces(params = {}) {
    return coworkingService.listForAdmin(params);
  },

  async createCoworkingSpace(actor, data) {
    const space = await coworkingService.create(data);
    await writeLog(actor, "admin.coworking.create", "CoworkingSpace", space._id, { title: space.title });
    return space;
  },

  async updateCoworkingSpace(actor, id, data) {
    const space = await coworkingService.updateById(id, data, actor);
    await writeLog(actor, "admin.coworking.update", "CoworkingSpace", space._id, { title: space.title });
    return space;
  },

  async deleteCoworkingSpace(actor, id) {
    const result = await coworkingService.deleteById(id, actor);
    await writeLog(actor, "admin.coworking.delete", "CoworkingSpace", id, {});
    return result;
  },
};

module.exports = adminService;
