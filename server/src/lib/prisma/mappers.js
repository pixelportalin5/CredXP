const { newLegacyMongoId, newUuid } = require("./legacyId");

const PROPERTY_TYPE_FROM_API = {
  "Pre-Leased Office": "Pre_Leased_Office",
  "Office Space": "Office_Space",
  "Retail/SCO": "Retail_SCO",
  Coworking: "Coworking",
  "Coworking Space": "Coworking_Space",
  Shop: "Shop",
  Warehouse: "Warehouse",
  "Commercial Land": "Commercial_Land",
};

const PROPERTY_TYPE_TO_API = Object.fromEntries(
  Object.entries(PROPERTY_TYPE_FROM_API).map(([api, prisma]) => [prisma, api])
);

const CONTACT_ENQUIRY_FROM_API = {
  "Investment Advisory": "Investment_Advisory",
  "Office Leasing": "Office_Leasing",
  Coworking: "Coworking",
  Partnership: "Partnership",
  "General Enquiry": "General_Enquiry",
};

const CONTACT_ENQUIRY_TO_API = Object.fromEntries(
  Object.entries(CONTACT_ENQUIRY_FROM_API).map(([api, prisma]) => [prisma, api])
);

const FURNISHING_FROM_API = {
  "Fully Furnished": "Fully_Furnished",
  "Semi Furnished": "Semi_Furnished",
  "Bare Shell": "Bare_Shell",
  "Warm Shell": "Warm_Shell",
};

const FURNISHING_TO_API = Object.fromEntries(
  Object.entries(FURNISHING_FROM_API).map(([api, prisma]) => [prisma, api])
);

/** API / Mongo display labels ↔ Prisma PropertyDisplayStatus enum keys */
const DISPLAY_STATUS_FROM_API = {
  "Recently Posted": "Recently_Posted",
  Recently_Posted: "Recently_Posted",
  Trending: "Trending",
};

const DISPLAY_STATUS_TO_API = {
  Recently_Posted: "Recently Posted",
  Trending: "Trending",
};

/** API grade labels ↔ Prisma PropertyGrade enum keys */
const GRADE_FROM_API = {
  A: "A",
  "A+": "A_Plus",
  A_Plus: "A_Plus",
  B: "B",
  "B+": "B_Plus",
  B_Plus: "B_Plus",
};

const GRADE_TO_API = {
  A: "A",
  A_Plus: "A+",
  B: "B",
  B_Plus: "B+",
};

function apiId(record) {
  if (!record) return null;
  return record.legacyMongoId || record.id;
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

function mapEnumToApi(map, value) {
  if (!value) return value;
  return map[value] || value;
}

function mapEnumFromApi(map, value) {
  if (!value) return value;
  return map[value] || value;
}

function toApiUser(record) {
  if (!record) return null;
  return {
    _id: apiId(record),
    name: record.name,
    email: record.email,
    phone: record.phone || undefined,
    avatar: record.avatar || undefined,
    avatarPublicId: record.avatarPublicId || undefined,
    role: record.role,
    accountStatus: record.accountStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toApiContactMessage(record) {
  if (!record) return null;
  return {
    _id: apiId(record),
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    company: record.company,
    enquiryType: mapEnumToApi(CONTACT_ENQUIRY_TO_API, record.enquiryType),
    message: record.message,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toPrismaContactCreate(data) {
  return {
    id: newUuid(),
    legacyMongoId: newLegacyMongoId(),
    fullName: data.fullName,
    email: String(data.email).toLowerCase(),
    phone: data.phone,
    company: data.company,
    enquiryType: mapEnumFromApi(CONTACT_ENQUIRY_FROM_API, data.enquiryType),
    message: data.message,
  };
}

function toApiProperty(record, { includeAll = true } = {}) {
  if (!record) return null;
  const base = {
    _id: apiId(record),
    title: record.title,
    type: mapEnumToApi(PROPERTY_TYPE_TO_API, record.type),
    seller: record.sellerId ? String(record.seller?.legacyMongoId || record.sellerId) : undefined,
    location: {
      address: record.locationAddress,
      city: record.locationCity,
      state: record.locationState,
      pincode: record.locationPincode || undefined,
      micromarket: record.locationMicromarket || undefined,
      landmark: record.locationLandmark || undefined,
    },
    price: record.price,
    size: record.size,
    financials: {
      price: record.financialPrice ?? undefined,
      priceUnit: record.financialPriceUnit || undefined,
      securityDeposit: record.financialSecurityDeposit ?? undefined,
      maintenanceCharges: record.financialMaintenanceCharges ?? undefined,
      rentalYield: record.financialRentalYield ?? undefined,
      capRate: record.financialCapRate ?? undefined,
      escalation: record.financialEscalation || undefined,
    },
    specs: {
      size: record.specSize ?? undefined,
      sizeUnit: record.specSizeUnit || undefined,
      floors: record.specFloors ?? undefined,
      totalFloors: record.specTotalFloors ?? undefined,
      furnishing: mapEnumToApi(FURNISHING_TO_API, record.specFurnishing) || undefined,
      parking: record.specParking ?? undefined,
      cabins: record.specCabins ?? undefined,
      workstations: record.specWorkstations ?? undefined,
      meetingRooms: record.specMeetingRooms ?? undefined,
      pantry: record.specPantry ?? undefined,
      washrooms: record.specWashrooms ?? undefined,
    },
    tenant: {
      name: record.tenantName || undefined,
      industry: record.tenantIndustry || undefined,
      leaseExpiry: record.tenantLeaseExpiry || undefined,
      lockInPeriod: record.tenantLockInPeriod || undefined,
    },
    amenities: record.amenities || [],
    highlights: record.highlights || [],
    images: record.images || [],
    imagePublicIds: record.imagePublicIds || [],
    coverImage: record.coverImage || "",
    coverImagePublicId: record.coverImagePublicId || "",
    status: mapEnumToApi(DISPLAY_STATUS_TO_API, record.status),
    grade: mapEnumToApi(GRADE_TO_API, record.grade) || undefined,
    occupancy: record.occupancy ?? undefined,
    reraId: record.reraId || undefined,
    buildingName: record.buildingName || undefined,
    description: record.description,
    isActive: record.isActive,
    featured: record.featured,
    views: record.views,
    enquiryCount: record.enquiryCount,
    listingStatus: record.listingStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  if (!includeAll) {
    delete base.description;
    delete base.highlights;
    delete base.amenities;
    delete base.buildingName;
    delete base.reraId;
    delete base.occupancy;
    delete base.images;
    delete base.imagePublicIds;
    delete base.updatedAt;
  }

  return base;
}

function propertyDataToPrisma(data, { sellerUuid } = {}) {
  const location = data.location || {};
  const financials = data.financials || {};
  const specs = data.specs || {};
  const tenant = data.tenant || {};

  return {
    title: data.title,
    type: mapEnumFromApi(PROPERTY_TYPE_FROM_API, data.type),
    sellerId: sellerUuid || null,
    locationAddress: location.address,
    locationCity: location.city,
    locationState: location.state,
    locationPincode: location.pincode || null,
    locationMicromarket: location.micromarket || null,
    locationLandmark: location.landmark || null,
    price: Number(data.price),
    size: Number(data.size),
    financialPrice: financials.price ?? null,
    financialPriceUnit: financials.priceUnit || null,
    financialSecurityDeposit: financials.securityDeposit ?? null,
    financialMaintenanceCharges: financials.maintenanceCharges ?? null,
    financialRentalYield: financials.rentalYield ?? null,
    financialCapRate: financials.capRate ?? null,
    financialEscalation: financials.escalation || null,
    specSize: specs.size ?? null,
    specSizeUnit: specs.sizeUnit || null,
    specFloors: specs.floors ?? null,
    specTotalFloors: specs.totalFloors ?? null,
    specFurnishing: mapEnumFromApi(FURNISHING_FROM_API, specs.furnishing) || null,
    specParking: specs.parking ?? null,
    specCabins: specs.cabins ?? null,
    specWorkstations: specs.workstations ?? null,
    specMeetingRooms: specs.meetingRooms ?? null,
    specPantry: specs.pantry ?? null,
    specWashrooms: specs.washrooms ?? null,
    tenantName: tenant.name || null,
    tenantIndustry: tenant.industry || null,
    tenantLeaseExpiry: tenant.leaseExpiry || null,
    tenantLockInPeriod: tenant.lockInPeriod || null,
    amenities: data.amenities || [],
    highlights: data.highlights || [],
    images: data.images || [],
    imagePublicIds: data.imagePublicIds || [],
    coverImage: data.coverImage || "",
    coverImagePublicId: data.coverImagePublicId || "",
    status: mapEnumFromApi(DISPLAY_STATUS_FROM_API, data.status) || "Recently_Posted",
    grade: data.grade ? mapEnumFromApi(GRADE_FROM_API, data.grade) : null,
    occupancy: data.occupancy ?? null,
    reraId: data.reraId || null,
    buildingName: data.buildingName || null,
    description: data.description,
    isActive: data.isActive !== false,
    featured: Boolean(data.featured),
    views: Number(data.views) || 0,
    enquiryCount: Number(data.enquiryCount) || 0,
    listingStatus: data.listingStatus || "published",
  };
}

function toApiCoworking(record) {
  if (!record) return null;
  return {
    _id: apiId(record),
    title: record.title,
    operator: record.operator,
    website: record.website || undefined,
    seller: record.sellerId ? String(record.seller?.legacyMongoId || record.sellerId) : undefined,
    location: {
      address: record.locationAddress,
      city: record.locationCity,
      state: record.locationState,
      micromarket: record.locationMicromarket || undefined,
      landmark: record.locationLandmark || undefined,
    },
    monthlySeatPrice: record.monthlySeatPrice,
    priceLabel: record.priceLabel,
    workspaceType: record.workspaceType,
    images: record.images || [],
    imagePublicIds: record.imagePublicIds || [],
    coverImage: record.coverImage || "",
    coverImagePublicId: record.coverImagePublicId || "",
    amenities: record.amenities || [],
    highlights: record.highlights || [],
    description: record.description,
    specs: {
      seatsFrom: record.specSeatsFrom ?? undefined,
      privateCabins: record.specPrivateCabins ?? undefined,
      meetingRooms: record.specMeetingRooms ?? undefined,
      internet: record.specInternet ?? undefined,
      parking: record.specParking ?? undefined,
    },
    isActive: record.isActive,
    featured: record.featured,
    views: record.views,
    enquiryCount: record.enquiryCount,
    listingStatus: record.listingStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function coworkingDataToPrisma(data, { sellerUuid } = {}) {
  const location = data.location || {};
  const specs = data.specs || {};
  return {
    title: data.title,
    operator: data.operator,
    website: data.website || null,
    sellerId: sellerUuid || null,
    locationAddress: location.address,
    locationCity: location.city,
    locationState: location.state,
    locationMicromarket: location.micromarket || null,
    locationLandmark: location.landmark || null,
    monthlySeatPrice: Number(data.monthlySeatPrice),
    priceLabel: data.priceLabel,
    workspaceType: data.workspaceType || "Coworking Space",
    images: data.images || [],
    imagePublicIds: data.imagePublicIds || [],
    coverImage: data.coverImage || "",
    coverImagePublicId: data.coverImagePublicId || "",
    amenities: data.amenities || [],
    highlights: data.highlights || [],
    description: data.description,
    specSeatsFrom: specs.seatsFrom ?? null,
    specPrivateCabins: specs.privateCabins ?? null,
    specMeetingRooms: specs.meetingRooms ?? null,
    specInternet: specs.internet ?? null,
    specParking: specs.parking ?? null,
    isActive: data.isActive !== false,
    featured: Boolean(data.featured),
    views: Number(data.views) || 0,
    enquiryCount: Number(data.enquiryCount) || 0,
    listingStatus: data.listingStatus || "published",
  };
}

function toApiEnquiry(record) {
  if (!record) return null;
  const property = record.property ? toApiProperty(record.property, { includeAll: false }) : record.propertyId;
  const coworking = record.coworkingSpace ? toApiCoworking(record.coworkingSpace) : record.coworkingSpaceId;

  return {
    _id: apiId(record),
    customerName: record.customerName,
    email: record.email,
    phone: record.phone || undefined,
    message: record.message || undefined,
    propertyId: property,
    coworkingSpaceId: coworking,
    sellerId: record.seller?.legacyMongoId || record.sellerId || undefined,
    userId: record.user?.legacyMongoId || record.userId || undefined,
    userArchived: record.userArchived,
    status: record.status,
    closedAt: record.closedAt || undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toApiProposal(record) {
  if (!record) return null;
  return {
    _id: apiId(record),
    createdBy: record.createdBy?.legacyMongoId || record.createdById,
    propertyId: record.property?.legacyMongoId || record.propertyId,
    propertyTitle: record.propertyTitle,
    propertyType: record.propertyType || undefined,
    agent: record.agent,
    propertySnapshot: record.propertySnapshot,
    coverImage: record.coverImage || undefined,
    coverImagePublicId: record.coverImagePublicId || undefined,
    preparedFor: record.preparedFor || undefined,
    agentResearch: record.agentResearch || undefined,
    overviewFields: record.overviewFields || undefined,
    detailFields: record.detailFields || undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toApiAuditLog(record) {
  if (!record) return null;
  return {
    _id: apiId(record),
    actor: record.actor ? toApiUser(record.actor) : undefined,
    action: record.action,
    entityType: record.entityType,
    entityId: record.entityLegacyMongoId || undefined,
    metadata: record.metadata || {},
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

module.exports = {
  apiId,
  toApiUser,
  toApiContactMessage,
  toPrismaContactCreate,
  toApiProperty,
  propertyDataToPrisma,
  toApiCoworking,
  coworkingDataToPrisma,
  toApiEnquiry,
  toApiProposal,
  toApiAuditLog,
  PROPERTY_TYPE_FROM_API,
  PROPERTY_TYPE_TO_API,
  FURNISHING_FROM_API,
  FURNISHING_TO_API,
  DISPLAY_STATUS_FROM_API,
  DISPLAY_STATUS_TO_API,
  GRADE_FROM_API,
  GRADE_TO_API,
};
