const { classifyPropertyType } = require("../utils/classifyPropertyType");
const { withBankRentedType } = require("../utils/bankTenant");

const ALLOWED_TYPES = new Set([
  "Pre-Leased Office",
  "Office Space",
  "Retail/SCO",
  "Coworking",
  "Coworking Space",
  "Shop",
  "Warehouse",
  "Commercial Land",
  "Bank Rented",
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
  // Zoho lookup / user fields arrive as { name, id }.
  if (typeof value === "object" && !Array.isArray(value)) {
    return value.name ? String(value.name).trim() : fallback;
  }
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
  if (lower.includes("bank")) return "Bank Rented";
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
  if (lower.includes("bare") || lower.includes("unfurnished")) return "Bare Shell";
  if (lower === "furnished") return "Fully Furnished";
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

/* ------------------------------------------------------------------
   CredXP's Zoho "Listings" module (API name Properties) uses its own
   field names. Translate them into the canonical keys picked below;
   canonical keys come first in every pick list, so these win.
   ------------------------------------------------------------------ */

const TYPE_OF_PROPERTY = {
  "pre-leased office space for sale": { type: "Pre-Leased Office", lease: false },
  "pre-leased commercial shop for sale": { type: "Retail/SCO", lease: false },
  "bank rented property for sale": { type: "Bank Rented", lease: false },
  "coworking space": { type: "Coworking Space", lease: true },
  "office space for lease": { type: "Office Space", lease: true },
  "commercial shop for lease": { type: "Shop", lease: true },
};

const RETAIL_HINTS = ["ground", "shop", "retail", "sco", "showroom", "road facing", "high street"];
const HIDDEN_STATUSES = { sold: "sold", closed: "sold", canceled: "paused", cancelled: "paused", expired: "paused", hold: "paused" };

function positiveNumber(value) {
  const num = asNumber(value);
  return num !== undefined && num > 0 ? num : undefined;
}

function years(value) {
  const num = positiveNumber(value);
  if (num === undefined) return undefined;
  return `${num} ${num === 1 ? "year" : "years"}`;
}

function normalizeCity(city) {
  const value = asString(city);
  return /^gurgaon$/i.test(value) ? "Gurugram" : value;
}

function isCredxpZohoLayout(record) {
  return ["Type_of_Property", "Leased_to_Brand", "Pre_Rented_Rent", "ROI_in", "Listing_Price", "Built_Up_Area"].some(
    (key) => key in record
  );
}

function fromCredxpZohoLayout(record) {
  if (!isCredxpZohoLayout(record)) return record;

  const tenant = asString(record.Leased_to_Brand);
  const building = asString(record.Name);
  const listingType = asString(record.Listing_Type).toLowerCase();
  const known = TYPE_OF_PROPERTY[asString(record.Type_of_Property).toLowerCase()];

  const preLeasedSignals = Boolean(
    tenant || positiveNumber(record.Pre_Rented_Rent) || positiveNumber(record.ROI_in) || listingType === "rented"
  );
  const isLease = known ? known.lease : listingType === "for lease" && !preLeasedSignals;

  let type = known?.type;
  if (!type) {
    if (isLease) type = "Office Space";
    else {
      const hints = [record.Floor_s, record.UNIT_NOS, record.Building_Uses, asString(record.Type_of_Property)]
        .map((v) => asString(v).toLowerCase())
        .join(" ");
      type = RETAIL_HINTS.some((hint) => hints.includes(hint)) ? "Retail/SCO" : "Pre-Leased Office";
    }
  }

  const listingPrice = positiveNumber(record.Listing_Price);
  const pricePerSqft = positiveNumber(record.Price_Per_Sqft);
  const price = isLease
    ? positiveNumber(record.Rent) ?? positiveNumber(record.Expected_Monthy_Rent)
    : listingPrice;
  const size =
    positiveNumber(record.Built_Up_Area) ??
    positiveNumber(record.Carpet_Area_Sq_ft) ??
    (listingPrice && pricePerSqft ? Math.round(listingPrice / pricePerSqft) : undefined);

  const recordStatus = asString(record.Record_Status__s).toLowerCase();
  const hiddenStatus = HIDDEN_STATUSES[asString(record.Property_Status).toLowerCase()];
  const listingStatus = recordStatus === "draft" || recordStatus === "trash" ? "draft" : hiddenStatus;

  const translated = {
    title: building && tenant && !isLease ? `${building} – Pre-Leased to ${tenant}` : building,
    buildingName: building,
    type,
    priceUnit: isLease ? "month" : "total",
    price,
    size,
    tenantName: tenant,
    rentPerSqft: positiveNumber(record.Pre_Rented_Rent),
    monthlyRent: isLease ? undefined : positiveNumber(record.Days_on_Market) ?? positiveNumber(record.Rent),
    rentalYield: positiveNumber(record.ROI_in),
    securityDeposit: positiveNumber(record.Security_Deposit),
    escalation: asString(record.Rent_Escalation),
    leaseTenure: years(record.Lease_Tenure_Years),
    lockInPeriod: years(record.Lock_in_Period_Years),
    leaseStart: asString(record.Lease_Start_Date),
    address: asString(record.Building_Address) || [record.Street, record.Street_2].map((v) => asString(v)).filter(Boolean).join(", "),
    city: normalizeCity(record.City),
    state: asString(record.State_Code),
    reraId: asString(record.MLS_Listing_ID),
    description: asString(record.Property_Description),
    listingStatus,
  };

  const clean = Object.fromEntries(
    Object.entries(translated).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  return { ...record, ...clean };
}

/**
 * Map a Zoho property record into CredXP Property fields (without images uploaded yet).
 * @returns {{ zohoId: string, mapped: object, imageUrls: string[] }}
 */
function mapZohoRecordToProperty(rawBody) {
  const record = fromCredxpZohoLayout(normalizeZohoPayload(rawBody));

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
    title ? `${title}.` : "Commercial property listing."
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
  const monthlyRent = asNumber(
    pick(record, ["monthlyRent", "Monthly_Rent", "Rent", "financials.monthlyRent"])
  );
  const rentPerSqft = asNumber(
    pick(record, ["rentPerSqft", "Rent_Per_Sqft", "Rent_Per_Sq_Ft", "financials.rentPerSqft"])
  );
  const securityDepositMonths = asNumber(
    pick(record, ["securityDepositMonths", "Security_Deposit_Months", "financials.securityDepositMonths"])
  );
  const priceUnitRaw = asString(pick(record, ["priceUnit", "Price_Unit", "financials.priceUnit"])).toLowerCase();

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
  const units = asNumber(pick(record, ["units", "Units", "No_of_Units", "No_Of_Units", "Number_Of_Units", "specs.units"]));
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

  const areaLeased = asNumber(
    pick(record, ["areaLeased", "Total_Area_Leased", "Area_Leased", "Total_Area_Taken", "tenant.areaLeased"])
  );
  const leaseTenure = asString(
    pick(record, ["leaseTenure", "Lease_Tenure", "Lease_Period", "tenant.leaseTenure"])
  );
  const leaseStart = asString(
    pick(record, ["leaseStart", "Lease_Start_Date", "Lease_Start", "tenant.leaseStart"])
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

  // Lease listings need month/year and sale listings need total, or the
  // /lease and /invest pages filter them out.
  const priceUnit = ALLOWED_PRICE_UNITS.has(priceUnitRaw)
    ? priceUnitRaw
    : type === "Office Space"
      ? "month"
      : "total";

  const featured = asBoolean(pick(record, ["featured", "Featured", "Is_Featured"])) ?? false;
  const activeFlag = asBoolean(pick(record, ["isActive", "Is_Active", "Active"])) ?? true;

  const listingStatusRaw = asString(
    pick(record, ["listingStatus", "Listing_Status", "Publish_Status"])
  ).toLowerCase();
  const publishToWebsite = asBoolean(
    pick(record, ["publishToWebsite", "Publish_to_Website", "Publish_To_Website", "publish_to_website"])
  );
  // An explicit "Publish to Website" checkbox wins; otherwise use the status
  // field; listings default to published.
  const listingStatus =
    publishToWebsite === false
      ? "draft"
      : ALLOWED_LISTING_STATUS.has(listingStatusRaw)
        ? listingStatusRaw
        : "published";

  // Unpublished or inactive in Zoho = hidden on the website.
  const isActive = activeFlag && listingStatus === "published";

  const statusRaw = asString(pick(record, ["status", "Status", "Display_Status"]), "Recently Posted");
  const status = ALLOWED_STATUS.has(statusRaw) ? statusRaw : "Recently Posted";

  if (!title) {
    const err = new Error("Zoho payload is missing title/Name");
    err.statusCode = 400;
    throw err;
  }

  const mapped = {
    title,
    type: withBankRentedType(type, tenantName, priceUnit),
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
      ...(monthlyRent !== undefined ? { monthlyRent } : {}),
      ...(rentPerSqft !== undefined ? { rentPerSqft } : {}),
      ...(securityDepositMonths !== undefined ? { securityDepositMonths } : {}),
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
      ...(units !== undefined ? { units } : {}),
    },
    tenant: {
      ...(tenantName ? { name: tenantName } : {}),
      ...(tenantIndustry ? { industry: tenantIndustry } : {}),
      ...(leaseExpiry ? { leaseExpiry } : {}),
      ...(lockInPeriod ? { lockInPeriod } : {}),
      ...(areaLeased !== undefined ? { areaLeased } : {}),
      ...(leaseTenure ? { leaseTenure } : {}),
      ...(leaseStart ? { leaseStart } : {}),
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
  fromCredxpZohoLayout,
  normalizeZohoPayload,
  extractImageUrls,
  mapZohoRecordToProperty,
};
