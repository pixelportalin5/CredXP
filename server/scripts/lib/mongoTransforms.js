function toDate(value, fallback = new Date()) {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function toStringArray(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

function requireEnum(map, value, label) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${label} is required`);
  }
  const mapped = map[String(value)];
  if (!mapped) {
    throw new Error(`${label} has unsupported value: ${value}`);
  }
  return mapped;
}

function optionalEnum(map, value) {
  if (value === undefined || value === null || value === "") return null;
  const mapped = map[String(value)];
  if (!mapped) {
    throw new Error(`Unsupported enum value: ${value}`);
  }
  return mapped;
}

const USER_ROLE = {
  buyer: "buyer",
  seller: "seller",
  admin: "admin",
  employee: "employee",
};

const ACCOUNT_STATUS = {
  active: "active",
  disabled: "disabled",
};

const PROPERTY_TYPE = {
  "Pre-Leased Office": "Pre_Leased_Office",
  "Office Space": "Office_Space",
  "Retail/SCO": "Retail_SCO",
  Coworking: "Coworking",
  "Coworking Space": "Coworking_Space",
  Shop: "Shop",
  Warehouse: "Warehouse",
  "Commercial Land": "Commercial_Land",
};

const PRICE_UNIT = {
  month: "month",
  year: "year",
  sqft: "sqft",
  total: "total",
};

const SIZE_UNIT = {
  sqft: "sqft",
  sqm: "sqm",
};

const FURNISHING = {
  "Fully Furnished": "Fully_Furnished",
  "Semi Furnished": "Semi_Furnished",
  "Bare Shell": "Bare_Shell",
  "Warm Shell": "Warm_Shell",
};

const PROPERTY_DISPLAY_STATUS = {
  "Recently Posted": "Recently_Posted",
  Trending: "Trending",
};

const PROPERTY_GRADE = {
  A: "A",
  "A+": "A_Plus",
  B: "B",
  "B+": "B_Plus",
};

const PROPERTY_LISTING_STATUS = {
  draft: "draft",
  published: "published",
  paused: "paused",
  sold: "sold",
};

const COWORKING_LISTING_STATUS = {
  draft: "draft",
  published: "published",
  paused: "paused",
};

const ENQUIRY_STATUS = {
  open: "open",
  closed: "closed",
};

const CONTACT_ENQUIRY_TYPE = {
  "Investment Advisory": "Investment_Advisory",
  "Office Leasing": "Office_Leasing",
  Coworking: "Coworking",
  Partnership: "Partnership",
  "General Enquiry": "General_Enquiry",
};

function transformUser(doc, userMap) {
  const legacyMongoId = String(doc._id);
  return {
    id: userMap.assign(legacyMongoId),
    legacyMongoId,
    name: String(doc.name || "").trim(),
    email: String(doc.email || "").trim().toLowerCase(),
    password: String(doc.password || ""),
    phone: doc.phone ? String(doc.phone).trim() : null,
    avatar: doc.avatar ? String(doc.avatar) : null,
    avatarPublicId: doc.avatarPublicId ? String(doc.avatarPublicId) : "",
    role: requireEnum(USER_ROLE, doc.role || "buyer", "user.role"),
    accountStatus: requireEnum(ACCOUNT_STATUS, doc.accountStatus || "active", "user.accountStatus"),
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
  };
}

function transformProperty(doc, maps) {
  const legacyMongoId = String(doc._id);
  const location = doc.location || {};
  const financials = doc.financials || {};
  const specs = doc.specs || {};
  const tenant = doc.tenant || {};

  return {
    id: maps.property.assign(legacyMongoId),
    legacyMongoId,
    title: String(doc.title || "").trim(),
    type: requireEnum(PROPERTY_TYPE, doc.type, "property.type"),
    sellerId: doc.seller ? maps.user.get(doc.seller) : null,
    locationAddress: String(location.address || "").trim(),
    locationCity: String(location.city || "").trim(),
    locationState: String(location.state || "").trim(),
    locationPincode: location.pincode ? String(location.pincode).trim() : null,
    locationMicromarket: location.micromarket ? String(location.micromarket).trim() : null,
    locationLandmark: location.landmark ? String(location.landmark).trim() : null,
    price: Number(doc.price) || 0,
    size: Number(doc.size) || 0,
    financialPrice: financials.price ?? null,
    financialPriceUnit: optionalEnum(PRICE_UNIT, financials.priceUnit),
    financialSecurityDeposit: financials.securityDeposit ?? null,
    financialMaintenanceCharges: financials.maintenanceCharges ?? null,
    financialRentalYield: financials.rentalYield ?? null,
    financialCapRate: financials.capRate ?? null,
    financialEscalation: financials.escalation ? String(financials.escalation) : null,
    specSize: specs.size ?? null,
    specSizeUnit: optionalEnum(SIZE_UNIT, specs.sizeUnit),
    specFloors: specs.floors ?? null,
    specTotalFloors: specs.totalFloors ?? null,
    specFurnishing: optionalEnum(FURNISHING, specs.furnishing),
    specParking: specs.parking ?? null,
    specCabins: specs.cabins ?? null,
    specWorkstations: specs.workstations ?? null,
    specMeetingRooms: specs.meetingRooms ?? null,
    specPantry: specs.pantry ?? null,
    specWashrooms: specs.washrooms ?? null,
    tenantName: tenant.name ? String(tenant.name) : null,
    tenantIndustry: tenant.industry ? String(tenant.industry) : null,
    tenantLeaseExpiry: tenant.leaseExpiry ? String(tenant.leaseExpiry) : null,
    tenantLockInPeriod: tenant.lockInPeriod ? String(tenant.lockInPeriod) : null,
    amenities: toStringArray(doc.amenities),
    highlights: toStringArray(doc.highlights),
    images: toStringArray(doc.images),
    imagePublicIds: toStringArray(doc.imagePublicIds),
    coverImage: doc.coverImage ? String(doc.coverImage) : "",
    coverImagePublicId: doc.coverImagePublicId ? String(doc.coverImagePublicId) : "",
    status: requireEnum(
      PROPERTY_DISPLAY_STATUS,
      doc.status || "Recently Posted",
      "property.status"
    ),
    grade: optionalEnum(PROPERTY_GRADE, doc.grade),
    occupancy: doc.occupancy ?? null,
    reraId: doc.reraId ? String(doc.reraId) : null,
    buildingName: doc.buildingName ? String(doc.buildingName) : null,
    description: String(doc.description || "").trim(),
    isActive: doc.isActive !== false,
    featured: Boolean(doc.featured),
    views: Number(doc.views) || 0,
    enquiryCount: Number(doc.enquiryCount) || 0,
    listingStatus: requireEnum(
      PROPERTY_LISTING_STATUS,
      doc.listingStatus || "published",
      "property.listingStatus"
    ),
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
  };
}

function transformCoworkingSpace(doc, maps) {
  const legacyMongoId = String(doc._id);
  const location = doc.location || {};
  const specs = doc.specs || {};

  return {
    id: maps.coworking.assign(legacyMongoId),
    legacyMongoId,
    title: String(doc.title || "").trim(),
    operator: String(doc.operator || "").trim(),
    website: doc.website ? String(doc.website).trim() : null,
    sellerId: doc.seller ? maps.user.get(doc.seller) : null,
    locationAddress: String(location.address || "").trim(),
    locationCity: String(location.city || "").trim(),
    locationState: String(location.state || "").trim(),
    locationMicromarket: location.micromarket ? String(location.micromarket).trim() : null,
    locationLandmark: location.landmark ? String(location.landmark).trim() : null,
    monthlySeatPrice: Number(doc.monthlySeatPrice) || 0,
    priceLabel: String(doc.priceLabel || "").trim(),
    workspaceType: doc.workspaceType ? String(doc.workspaceType) : "Coworking Space",
    images: toStringArray(doc.images),
    imagePublicIds: toStringArray(doc.imagePublicIds),
    coverImage: doc.coverImage ? String(doc.coverImage) : "",
    coverImagePublicId: doc.coverImagePublicId ? String(doc.coverImagePublicId) : "",
    amenities: toStringArray(doc.amenities),
    highlights: toStringArray(doc.highlights),
    description: String(doc.description || "").trim(),
    specSeatsFrom: specs.seatsFrom ?? null,
    specPrivateCabins: specs.privateCabins ?? null,
    specMeetingRooms: specs.meetingRooms ?? null,
    specInternet: specs.internet ?? null,
    specParking: specs.parking ?? null,
    isActive: doc.isActive !== false,
    featured: Boolean(doc.featured),
    views: Number(doc.views) || 0,
    enquiryCount: Number(doc.enquiryCount) || 0,
    listingStatus: requireEnum(
      COWORKING_LISTING_STATUS,
      doc.listingStatus || "published",
      "coworking.listingStatus"
    ),
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
  };
}

function transformEnquiry(doc, maps) {
  const legacyMongoId = String(doc._id);

  return {
    id: maps.enquiry.assign(legacyMongoId),
    legacyMongoId,
    customerName: String(doc.customerName || "").trim(),
    email: String(doc.email || "").trim().toLowerCase(),
    phone: doc.phone ? String(doc.phone).trim() : null,
    message: doc.message ? String(doc.message) : null,
    propertyId: doc.propertyId ? maps.property.get(doc.propertyId) : null,
    coworkingSpaceId: doc.coworkingSpaceId ? maps.coworking.get(doc.coworkingSpaceId) : null,
    sellerId: doc.sellerId ? maps.user.get(doc.sellerId) : null,
    userId: doc.userId ? maps.user.get(doc.userId) : null,
    userArchived: Boolean(doc.userArchived),
    status: requireEnum(ENQUIRY_STATUS, doc.status || "open", "enquiry.status"),
    closedAt: doc.closedAt ? toDate(doc.closedAt) : null,
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
  };
}

function transformProposal(doc, maps) {
  const legacyMongoId = String(doc._id);
  const createdById = maps.user.get(doc.createdBy);
  const propertyId = maps.property.get(doc.propertyId);

  if (!createdById) {
    throw new Error(`Missing createdBy user mapping for ${doc.createdBy}`);
  }
  if (!propertyId) {
    throw new Error(`Missing property mapping for ${doc.propertyId}`);
  }

  return {
    id: maps.proposal.assign(legacyMongoId),
    legacyMongoId,
    createdById,
    propertyId,
    propertyTitle: String(doc.propertyTitle || "").trim(),
    propertyType: doc.propertyType ? String(doc.propertyType) : null,
    agent: doc.agent || {},
    propertySnapshot: doc.propertySnapshot || {},
    coverImage: doc.coverImage ? String(doc.coverImage) : null,
    coverImagePublicId: doc.coverImagePublicId ? String(doc.coverImagePublicId) : "",
    preparedFor: doc.preparedFor || null,
    agentResearch: doc.agentResearch || null,
    overviewFields: doc.overviewFields || null,
    detailFields: doc.detailFields || null,
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
  };
}

function transformSavedProperty(doc, maps) {
  const legacyMongoId = String(doc._id);
  const userId = maps.user.get(doc.userId);
  const propertyId = maps.property.get(doc.propertyId);

  if (!userId) throw new Error(`Missing user mapping for saved property ${doc.userId}`);
  if (!propertyId) throw new Error(`Missing property mapping for saved property ${doc.propertyId}`);

  return {
    id: maps.savedProperty.assign(legacyMongoId),
    legacyMongoId,
    userId,
    propertyId,
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
  };
}

function transformContactMessage(doc, contactMap) {
  const legacyMongoId = String(doc._id);
  return {
    id: contactMap.assign(legacyMongoId),
    legacyMongoId,
    fullName: String(doc.fullName || "").trim(),
    email: String(doc.email || "").trim().toLowerCase(),
    phone: String(doc.phone || "").trim(),
    company: String(doc.company || "").trim(),
    enquiryType: requireEnum(CONTACT_ENQUIRY_TYPE, doc.enquiryType, "contact.enquiryType"),
    message: String(doc.message || "").trim(),
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
  };
}

function transformAuditLog(doc, maps) {
  const legacyMongoId = String(doc._id);
  return {
    id: maps.auditLog.assign(legacyMongoId),
    legacyMongoId,
    actorId: doc.actor ? maps.user.get(doc.actor) : null,
    action: String(doc.action || "").trim(),
    entityType: String(doc.entityType || "").trim(),
    entityLegacyMongoId: doc.entityId ? String(doc.entityId) : null,
    metadata: doc.metadata && typeof doc.metadata === "object" ? doc.metadata : {},
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
  };
}

module.exports = {
  transformUser,
  transformProperty,
  transformCoworkingSpace,
  transformEnquiry,
  transformProposal,
  transformSavedProperty,
  transformContactMessage,
  transformAuditLog,
};
