const { classifyPropertyType } = require("../utils/classifyPropertyType");

const ALLOWED_TYPES = new Set([
  "Pre-Leased Office",
  "Office Space",
  "Retail/SCO",
  "Coworking",
  "Coworking Space",
  "Shop",
  "Warehouse",
  "Commercial Land",
]);

const ALLOWED_FURNISHING = new Set([
  "Fully Furnished",
  "Semi Furnished",
  "Bare Shell",
  "Warm Shell",
]);

const ALLOWED_PRICE_UNITS = new Set(["month", "year", "sqft", "total"]);
const ALLOWED_SIZE_UNITS = new Set(["sqft", "sqm"]);
const ALLOWED_GRADES = new Set(["A", "A+", "B", "B+"]);
const ALLOWED_LISTING_STATUS = new Set(["draft", "published", "paused", "sold"]);
const ALLOWED_STATUS = new Set(["Recently Posted", "Trending"]);

/**
 * Normalize Zoho webhook / API payloads into a flat record object.
 * Supports:
 * - Flat form/JSON body (workflow webhook module parameters)
 * - Zoho CRM API style: { data: [ { id, ...fields } ] }
 * - Nested: { record: {...} } or { Property: {...} }
 */
function normalizeZohoPayload(body = {}) {
  if (!body || typeof body !== "object") return {};

  if (Array.isArray(body.data) && body.data[0] && typeof body.data[0] === "object") {
    return body.data[0];
  }

  if (body.record && typeof body.record === "object") {
    return body.record;
  }

  if (body.Property && typeof body.Property === "object") {
    return body.Property;
  }

  if (body.properties && typeof body.properties === "object" && !Array.isArray(body.properties)) {
    return body.properties;
  }

  return body;
}

function getPath(record, path) {
  if (!path.includes(".")) return record[path];
  return path.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[key];
  }, record);
}

function pick(record, keys) {
  for (const key of keys) {
    const value = getPath(record, key);
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return undefined;
}

function asString(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function asNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const cleaned = String(value).replace(/,/g, "").replace(/[₹$]/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : undefined;
}

function asBoolean(value) {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  if (["true", "yes", "1", "y"].includes(normalized)) return true;
  if (["false", "no", "0", "n"].includes(normalized)) return false;
  return undefined;
}

function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,|;]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

function mapPropertyType(rawType, title, description) {
  const candidate = asString(rawType);
  if (ALLOWED_TYPES.has(candidate)) return candidate;

  const lower = candidate.toLowerCase();
  if (lower.includes("warehouse")) return "Warehouse";
  if (lower.includes("commercial land") || lower.includes("land")) return "Commercial Land";
  if (lower.includes("cowork")) return "Coworking Space";
  if (lower.includes("retail") || lower.includes("sco")) return "Retail/SCO";
  if (lower.includes("office space") || lower === "office") return "Office Space";
  if (lower.includes("shop")) return "Shop";
  if (lower.includes("pre-leased") || lower.includes("pre leased")) return "Pre-Leased Office";

  return classifyPropertyType(title, description, candidate) || "Office Space";
}

function mapFurnishing(value) {
  const candidate = asString(value);
  if (ALLOWED_FURNISHING.has(candidate)) return candidate;

  const lower = candidate.toLowerCase();
  if (lower.includes("fully")) return "Fully Furnished";
  if (lower.includes("semi")) return "Semi Furnished";
  if (lower.includes("warm")) return "Warm Shell";
  if (lower.includes("bare")) return "Bare Shell";
  return undefined;
}

/**
 * Extract image URLs from common Zoho field shapes.
 */
function extractImageUrls(record) {
  const urls = [];

  const pushUrl = (value) => {
    if (!value) return;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^https?:\/\//i.test(trimmed)) urls.push(trimmed);
      return;
    }
    if (typeof value === "object") {
      const nested =
        value.download_url ||
        value.Download_Url ||
        value.url ||
        value.Url ||
        value.File_Url ||
        value.file_url ||
        value.preview_url;
      if (typeof nested === "string" && /^https?:\/\//i.test(nested.trim())) {
        urls.push(nested.trim());
      }
    }
  };

  const listCandidates = [
    record.images,
    record.Images,
    record.Image_URLs,
    record.Image_Urls,
    record.Photo_URLs,
    record.Attachments,
    record.attachments,
  ];

  for (const candidate of listCandidates) {
    if (Array.isArray(candidate)) {
      candidate.forEach(pushUrl);
    } else if (typeof candidate === "string") {
      asStringArray(candidate).forEach(pushUrl);
    }
  }

  [
    "Image_1",
    "Image_2",
    "Image_3",
    "Image_4",
    "Image_5",
    "Cover_Image",
    "Cover_Image_URL",
    "Photo",
    "Photo_1",
    "Photo_2",
    "Photo_3",
  ].forEach((key) => pushUrl(record[key]));

  return [...new Set(urls)];
}

/**
 * Map a Zoho property record into CredXP Property fields (without images uploaded yet).
 * @returns {{ zohoId: string, mapped: object, imageUrls: string[] }}
 */
function mapZohoRecordToProperty(rawBody) {
  const record = normalizeZohoPayload(rawBody);

  const zohoId = asString(
    pick(record, ["id", "Id", "ID", "zohoId", "Zoho_Id", "Record_Id", "record_id"])
  );

  if (!zohoId) {
    const err = new Error("Zoho payload is missing record id");
    err.statusCode = 400;
    throw err;
  }

  const title = asString(pick(record, ["title", "Title", "Name", "Property_Name", "Property_Title"]));
  const description = asString(
    pick(record, ["description", "Description", "Property_Description", "Details"]),
    title ? `${title} — commercial listing synced from Zoho CRM.` : "Commercial listing synced from Zoho CRM."
  );

  const type = mapPropertyType(
    pick(record, ["type", "Type", "Property_Type", "Listing_Type"]),
    title,
    description
  );

  const address = asString(
    pick(record, ["address", "Address", "location.address", "Location_Address", "Street"]),
    "Address TBD"
  );
  const city = asString(pick(record, ["city", "City", "location.city", "Location_City"]), "Gurugram");
  const state = asString(
    pick(record, ["state", "State", "location.state", "Location_State"]),
    "Haryana"
  );

  const price =
    asNumber(pick(record, ["price", "Price", "Asking_Price", "Sale_Price", "Investment_Amount"])) ?? 0;
  const size =
    asNumber(pick(record, ["size", "Size", "Area", "Built_Up_Area", "Carpet_Area", "specs.size"])) ?? 0;

  const rentalYield = asNumber(
    pick(record, ["rentalYield", "Rental_Yield", "Yield", "financials.rentalYield"])
  );
  const capRate = asNumber(pick(record, ["capRate", "Cap_Rate", "financials.capRate"]));
  const securityDeposit = asNumber(
    pick(record, ["securityDeposit", "Security_Deposit", "financials.securityDeposit"])
  );
  const maintenanceCharges = asNumber(
    pick(record, ["maintenanceCharges", "Maintenance_Charges", "financials.maintenanceCharges"])
  );
  const escalation = asString(
    pick(record, ["escalation", "Escalation", "financials.escalation"])
  );
  const priceUnitRaw = asString(
    pick(record, ["priceUnit", "Price_Unit", "financials.priceUnit"]),
    "total"
  ).toLowerCase();
  const priceUnit = ALLOWED_PRICE_UNITS.has(priceUnitRaw) ? priceUnitRaw : "total";

  const floors = asNumber(pick(record, ["floors", "Floor", "Floor_Number", "specs.floors"]));
  const totalFloors = asNumber(pick(record, ["totalFloors", "Total_Floors", "specs.totalFloors"]));
  const parking = asNumber(pick(record, ["parking", "Parking", "Parking_Slots", "specs.parking"]));
  const cabins = asNumber(pick(record, ["cabins", "Cabins", "specs.cabins"]));
  const workstations = asNumber(
    pick(record, ["workstations", "Workstations", "Seats", "specs.workstations"])
  );
  const meetingRooms = asNumber(
    pick(record, ["meetingRooms", "Meeting_Rooms", "specs.meetingRooms"])
  );
  const washrooms = asNumber(pick(record, ["washrooms", "Washrooms", "specs.washrooms"]));
  const pantry = asBoolean(pick(record, ["pantry", "Pantry", "specs.pantry"]));
  const sizeUnitRaw = asString(pick(record, ["sizeUnit", "Size_Unit", "specs.sizeUnit"]), "sqft").toLowerCase();
  const sizeUnit = ALLOWED_SIZE_UNITS.has(sizeUnitRaw) ? sizeUnitRaw : "sqft";
  const furnishing = mapFurnishing(
    pick(record, ["furnishing", "Furnishing", "Furnishing_Status", "specs.furnishing"])
  );

  const tenantName = asString(pick(record, ["tenantName", "Tenant_Name", "Tenant", "tenant.name"]));
  const tenantIndustry = asString(
    pick(record, ["tenantIndustry", "Tenant_Industry", "Industry", "tenant.industry"])
  );
  const leaseExpiry = asString(
    pick(record, ["leaseExpiry", "Lease_Expiry", "Lease_End_Date", "tenant.leaseExpiry"])
  );
  const lockInPeriod = asString(
    pick(record, ["lockInPeriod", "Lock_In_Period", "Lock_In", "tenant.lockInPeriod"])
  );

  const amenities = asStringArray(pick(record, ["amenities", "Amenities"]));
  const highlights = asStringArray(pick(record, ["highlights", "Highlights", "Key_Highlights"]));

  const gradeRaw = asString(pick(record, ["grade", "Grade", "Building_Grade"]));
  const grade = ALLOWED_GRADES.has(gradeRaw) ? gradeRaw : undefined;
  const occupancy = asNumber(pick(record, ["occupancy", "Occupancy", "Occupancy_Percent"]));
  const reraId = asString(pick(record, ["reraId", "RERA_ID", "Rera_Id", "RERA"]));
  const buildingName = asString(
    pick(record, ["buildingName", "Building_Name", "Project_Name", "Building"])
  );

  const featured = asBoolean(pick(record, ["featured", "Featured", "Is_Featured"])) ?? false;
  const isActive = asBoolean(pick(record, ["isActive", "Is_Active", "Active"])) ?? true;

  const listingStatusRaw = asString(
    pick(record, ["listingStatus", "Listing_Status", "Publish_Status"]),
    "published"
  ).toLowerCase();
  const listingStatus = ALLOWED_LISTING_STATUS.has(listingStatusRaw)
    ? listingStatusRaw
    : asBoolean(pick(record, ["Publish_to_Website", "Publish_To_Website"])) === false
      ? "draft"
      : "published";

  const statusRaw = asString(pick(record, ["status", "Status", "Display_Status"]), "Recently Posted");
  const status = ALLOWED_STATUS.has(statusRaw) ? statusRaw : "Recently Posted";

  if (!title) {
    const err = new Error("Zoho payload is missing title/Name");
    err.statusCode = 400;
    throw err;
  }

  const mapped = {
    title,
    type,
    description,
    location: { address, city, state },
    price,
    size,
    financials: {
      price,
      priceUnit,
      ...(securityDeposit !== undefined ? { securityDeposit } : {}),
      ...(maintenanceCharges !== undefined ? { maintenanceCharges } : {}),
      ...(rentalYield !== undefined ? { rentalYield } : {}),
      ...(capRate !== undefined ? { capRate } : {}),
      ...(escalation ? { escalation } : {}),
    },
    specs: {
      size,
      sizeUnit,
      ...(floors !== undefined ? { floors } : {}),
      ...(totalFloors !== undefined ? { totalFloors } : {}),
      ...(furnishing ? { furnishing } : {}),
      ...(parking !== undefined ? { parking } : {}),
      ...(cabins !== undefined ? { cabins } : {}),
      ...(workstations !== undefined ? { workstations } : {}),
      ...(meetingRooms !== undefined ? { meetingRooms } : {}),
      ...(pantry !== undefined ? { pantry } : {}),
      ...(washrooms !== undefined ? { washrooms } : {}),
    },
    tenant: {
      ...(tenantName ? { name: tenantName } : {}),
      ...(tenantIndustry ? { industry: tenantIndustry } : {}),
      ...(leaseExpiry ? { leaseExpiry } : {}),
      ...(lockInPeriod ? { lockInPeriod } : {}),
    },
    amenities,
    highlights,
    ...(grade ? { grade } : {}),
    ...(occupancy !== undefined ? { occupancy } : {}),
    ...(reraId ? { reraId } : {}),
    ...(buildingName ? { buildingName } : {}),
    featured,
    isActive,
    listingStatus,
    status,
    zohoId,
    zohoLastSync: new Date(),
  };

  return {
    zohoId,
    mapped,
    imageUrls: extractImageUrls(record),
  };
}

module.exports = {
  normalizeZohoPayload,
  extractImageUrls,
  mapZohoRecordToProperty,
};
