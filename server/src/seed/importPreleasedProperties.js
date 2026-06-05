require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const path = require("path");
const xlsx = require("xlsx");
const connectDB = require("../config/db");
const Property = require("../models/Property");
const User = require("../models/User");
const Enquiry = require("../models/Enquiry");
const SavedProperty = require("../models/SavedProperty");

const { classifyPropertyType } = require("../utils/classifyPropertyType");

const WORKBOOK_PATH = path.resolve(__dirname, "../../../client/public/data/properties_filled.xlsx");
const TEMP_IMAGES = ["/images/office1.png", "/images/office2.png", "/images/office1.png"];
const ADMIN_EMAIL = "admin@gmail.com";

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function optionalString(value) {
  const next = clean(value);
  return next || undefined;
}

function optionalNumber(value) {
  const next = clean(value);
  if (!next) return undefined;
  const parsed = Number(next);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function requiredNumber(value, fieldName, rowNumber) {
  const parsed = optionalNumber(value);
  if (parsed === undefined) {
    throw new Error(`Row ${rowNumber}: ${fieldName} is required and must be numeric`);
  }
  return parsed;
}

function booleanValue(value, defaultValue = false) {
  const next = clean(value).toLowerCase();
  if (!next) return defaultValue;
  return ["true", "yes", "y", "1", "active", "published"].includes(next);
}

function splitList(value) {
  return clean(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readRows() {
  const workbook = xlsx.readFile(WORKBOOK_PATH);
  const sheet = workbook.Sheets.Properties || workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { defval: "", raw: false });
}

function rowToProperty(row, rowNumber, sellerId, images) {
  const title = clean(row.title);
  const description = clean(row.description);
  const type = classifyPropertyType(title, description, row.type);
  const status = clean(row.status) || "Recently Posted";
  const price = requiredNumber(row.price, "price", rowNumber);
  const size = requiredNumber(row.size, "size", rowNumber);

  if (!title) throw new Error(`Row ${rowNumber}: title is required`);
  if (!description) throw new Error(`Row ${rowNumber}: description is required`);
  if (!clean(row.address)) throw new Error(`Row ${rowNumber}: address is required`);
  if (!clean(row.city)) throw new Error(`Row ${rowNumber}: city is required`);
  if (!clean(row.state)) throw new Error(`Row ${rowNumber}: state is required`);

  return {
    title,
    type,
    seller: sellerId,
    location: {
      address: clean(row.address),
      city: clean(row.city),
      state: clean(row.state),
    },
    price,
    size,
    financials: {
      price: optionalNumber(row.financialPrice) ?? price,
      priceUnit: clean(row.priceUnit) || "total",
      securityDeposit: optionalNumber(row.securityDeposit),
      maintenanceCharges: optionalNumber(row.maintenanceCharges),
      rentalYield: optionalNumber(row.rentalYield),
      capRate: optionalNumber(row.capRate),
      escalation: optionalString(row.escalation),
    },
    specs: {
      size: optionalNumber(row.specSize) ?? size,
      sizeUnit: clean(row.sizeUnit) || "sqft",
      floors: optionalNumber(row.floors),
      totalFloors: optionalNumber(row.totalFloors),
      furnishing: optionalString(row.furnishing),
      parking: optionalNumber(row.parking),
      cabins: optionalNumber(row.cabins),
      workstations: optionalNumber(row.workstations),
      meetingRooms: optionalNumber(row.meetingRooms),
      pantry: booleanValue(row.pantry),
      washrooms: optionalNumber(row.washrooms),
    },
    tenant: {
      name: optionalString(row.tenantName),
      industry: optionalString(row.tenantIndustry),
      leaseExpiry: optionalString(row.leaseExpiry),
      lockInPeriod: optionalString(row.lockInPeriod),
    },
    amenities: splitList(row.amenities),
    images,
    status,
    grade: optionalString(row.grade),
    occupancy: optionalNumber(row.occupancy),
    reraId: optionalString(row.reraId),
    buildingName: optionalString(row.buildingName),
    highlights: splitList(row.highlights),
    description,
    isActive: booleanValue(row.isActive, true),
    featured: booleanValue(row.featured),
    listingStatus: clean(row.listingStatus) || "published",
  };
}

async function importPreleasedProperties() {
  await connectDB();

  const admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    throw new Error(`Admin user not found: ${ADMIN_EMAIL}`);
  }
  if (admin.role !== "admin") {
    throw new Error(`${ADMIN_EMAIL} must have role "admin" before import`);
  }

  const rows = readRows();
  const failures = [];
  const properties = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    try {
      properties.push(rowToProperty(row, rowNumber, admin._id, TEMP_IMAGES));
    } catch (error) {
      failures.push({ row: rowNumber, error: error.message });
    }
  });

  if (failures.length > 0) {
    console.error("Import stopped because some rows failed validation:");
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  const [deletedProperties, deletedEnquiries, deletedSavedProperties] = await Promise.all([
    Property.deleteMany({}),
    Enquiry.deleteMany({}),
    SavedProperty.deleteMany({}),
  ]);
  const inserted = await Property.insertMany(properties, { ordered: true });

  console.log(JSON.stringify({
    success: true,
    sourceRows: rows.length,
    deletedProperties: deletedProperties.deletedCount,
    deletedEnquiries: deletedEnquiries.deletedCount,
    deletedSavedProperties: deletedSavedProperties.deletedCount,
    importedProperties: inserted.length,
    ownerEmail: admin.email,
    ownerId: admin._id,
    imageCountPerProperty: TEMP_IMAGES.length,
  }, null, 2));

  process.exit(0);
}

importPreleasedProperties().catch((error) => {
  console.error("Pre-leased property import failed:", error.message);
  process.exit(1);
});
