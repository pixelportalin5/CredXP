const path = require("path");
const AdmZip = require("adm-zip");
const ExcelJS = require("exceljs");
const xlsx = require("xlsx");
const propertyService = require("./propertyService");
const imageUploadService = require("./imageUploadService");

const TEMPLATE_COLUMNS = [
  "title",
  "type",
  "status",
  "buildingName",
  "description",
  "address",
  "city",
  "state",
  "pincode",
  "micromarket",
  "landmark",
  "price",
  "size",
  "financialPrice",
  "priceUnit",
  "securityDeposit",
  "maintenanceCharges",
  "rentalYield",
  "capRate",
  "escalation",
  "specSize",
  "sizeUnit",
  "floors",
  "totalFloors",
  "furnishing",
  "parking",
  "cabins",
  "workstations",
  "meetingRooms",
  "pantry",
  "washrooms",
  "tenantName",
  "tenantIndustry",
  "leaseExpiry",
  "lockInPeriod",
  "reraId",
  "grade",
  "occupancy",
  "amenities",
  "highlights",
  "isActive",
  "featured",
  "listingStatus",
  "image1",
  "image2",
  "image3",
];

const TEMPLATE_COLUMN_WIDTHS = {
  title: 30,
  type: 18,
  status: 18,
  buildingName: 24,
  description: 44,
  address: 34,
  city: 16,
  state: 16,
  pincode: 12,
  micromarket: 22,
  landmark: 24,
  price: 14,
  size: 10,
  financialPrice: 16,
  priceUnit: 12,
  securityDeposit: 16,
  maintenanceCharges: 18,
  rentalYield: 12,
  capRate: 10,
  escalation: 18,
  specSize: 10,
  sizeUnit: 10,
  floors: 8,
  totalFloors: 12,
  furnishing: 20,
  parking: 10,
  cabins: 10,
  workstations: 14,
  meetingRooms: 14,
  pantry: 10,
  washrooms: 12,
  tenantName: 24,
  tenantIndustry: 20,
  leaseExpiry: 14,
  lockInPeriod: 16,
  reraId: 18,
  grade: 8,
  occupancy: 12,
  amenities: 34,
  highlights: 34,
  isActive: 10,
  featured: 10,
  listingStatus: 14,
  image1: 22,
  image2: 22,
  image3: 22,
};

const REQUIRED_COLUMNS = [
  "title",
  "type",
  "status",
  "description",
  "address",
  "city",
  "state",
  "price",
  "size",
  "financialPrice",
  "specSize",
  "image1",
  "image2",
  "image3",
];

const ENUMS = {
  type: ["Office Space", "Shop", "Coworking Space"],
  status: ["Recently Posted", "Trending"],
  priceUnit: ["month", "year", "sqft", "total"],
  sizeUnit: ["sqft", "sqm"],
  furnishing: ["Fully Furnished", "Semi Furnished", "Bare Shell", "Warm Shell"],
  grade: ["A", "A+", "B", "B+"],
  listingStatus: ["draft", "published", "paused", "sold"],
};

const IMAGE_MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function optionalString(value) {
  const next = clean(value);
  return next || undefined;
}

function numberValue(value, label, errors, required = false) {
  const next = clean(value);
  if (!next) {
    if (required) errors.push(`${label} is required`);
    return undefined;
  }
  const parsed = Number(next);
  if (Number.isNaN(parsed)) {
    errors.push(`${label} must be a number`);
    return undefined;
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

function validateEnum(field, value, errors) {
  const next = clean(value);
  if (!next) return undefined;
  if (!ENUMS[field].includes(next)) {
    errors.push(`${field} must be one of: ${ENUMS[field].join(", ")}`);
    return undefined;
  }
  return next;
}

async function uploadEntry(entry) {
  const ext = path.extname(entry.entryName).toLowerCase();
  const mime = IMAGE_MIME_BY_EXT[ext];
  if (!mime) return null;

  const buffer = entry.getData();
  return imageUploadService.uploadBuffer(buffer, mime, "property");
}

async function buildImageMap(zipFile) {
  const zip = new AdmZip(zipFile.buffer);
  const images = new Map();

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const basename = path.basename(entry.entryName).toLowerCase();
    const uploaded = await uploadEntry(entry);
    if (uploaded) images.set(basename, uploaded);
  }

  return images;
}

function findImage(row, column, imageMap, errors) {
  const filename = clean(row[column]);
  if (!filename) {
    errors.push(`${column} filename is required`);
    return null;
  }

  const image = imageMap.get(path.basename(filename).toLowerCase());
  if (!image) {
    errors.push(`${column} "${filename}" was not found in the ZIP`);
    return null;
  }

  return image;
}

function imageUrlsFromRow(image1, image2, image3) {
  return [image1.imageUrl, image2.imageUrl, image3.imageUrl];
}

function imagePublicIdsFromRow(image1, image2, image3) {
  return [image1.publicId, image2.publicId, image3.publicId];
}

function rowToProperty(row, imageMap) {
  const errors = [];

  REQUIRED_COLUMNS.forEach((column) => {
    if (!clean(row[column])) errors.push(`${column} is required`);
  });

  const type = validateEnum("type", row.type, errors);
  const status = validateEnum("status", row.status, errors);
  const priceUnit = validateEnum("priceUnit", row.priceUnit || "total", errors);
  const sizeUnit = validateEnum("sizeUnit", row.sizeUnit || "sqft", errors);
  const furnishing = validateEnum("furnishing", row.furnishing, errors);
  const grade = validateEnum("grade", row.grade, errors);
  const listingStatus = validateEnum("listingStatus", row.listingStatus || "published", errors);
  const image1 = findImage(row, "image1", imageMap, errors);
  const image2 = findImage(row, "image2", imageMap, errors);
  const image3 = findImage(row, "image3", imageMap, errors);

  const price = numberValue(row.price, "price", errors, true);
  const size = numberValue(row.size, "size", errors, true);
  const financialPrice = numberValue(row.financialPrice, "financialPrice", errors, true);
  const specSize = numberValue(row.specSize, "specSize", errors, true);

  if (errors.length > 0) {
    return { errors };
  }

  return {
    property: {
      title: clean(row.title),
      type,
      location: {
        address: clean(row.address),
        city: clean(row.city),
        state: clean(row.state),
        pincode: optionalString(row.pincode),
        micromarket: optionalString(row.micromarket),
        landmark: optionalString(row.landmark),
      },
      price,
      size,
      financials: {
        price: financialPrice,
        priceUnit,
        securityDeposit: numberValue(row.securityDeposit, "securityDeposit", errors),
        maintenanceCharges: numberValue(row.maintenanceCharges, "maintenanceCharges", errors),
        rentalYield: numberValue(row.rentalYield, "rentalYield", errors),
        capRate: numberValue(row.capRate, "capRate", errors),
        escalation: optionalString(row.escalation),
      },
      specs: {
        size: specSize,
        sizeUnit,
        floors: numberValue(row.floors, "floors", errors),
        totalFloors: numberValue(row.totalFloors, "totalFloors", errors),
        furnishing,
        parking: numberValue(row.parking, "parking", errors),
        cabins: numberValue(row.cabins, "cabins", errors),
        workstations: numberValue(row.workstations, "workstations", errors),
        meetingRooms: numberValue(row.meetingRooms, "meetingRooms", errors),
        pantry: booleanValue(row.pantry),
        washrooms: numberValue(row.washrooms, "washrooms", errors),
      },
      tenant: {
        name: optionalString(row.tenantName),
        industry: optionalString(row.tenantIndustry),
        leaseExpiry: optionalString(row.leaseExpiry),
        lockInPeriod: optionalString(row.lockInPeriod),
      },
      amenities: splitList(row.amenities),
      images: imageUrlsFromRow(image1, image2, image3),
      imagePublicIds: imagePublicIdsFromRow(image1, image2, image3),
      coverImagePublicId: image1.publicId,
      status,
      grade,
      occupancy: numberValue(row.occupancy, "occupancy", errors),
      reraId: optionalString(row.reraId),
      buildingName: optionalString(row.buildingName),
      highlights: splitList(row.highlights),
      description: clean(row.description),
      isActive: booleanValue(row.isActive, true),
      featured: booleanValue(row.featured),
      listingStatus,
    },
    errors,
  };
}

function parseWorkbookRows(excelFile) {
  const workbook = xlsx.read(excelFile.buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  return xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    defval: "",
    raw: false,
  });
}

async function generateTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CredXP";
  workbook.created = new Date();

  const sampleRow = {
    title: "Sample Office Space",
    type: "Office Space",
    status: "Recently Posted",
    buildingName: "CredXP Tower",
    description: "Premium commercial office listing description.",
    address: "Plot 1, Business District",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122001",
    micromarket: "Golf Course Road",
    landmark: "Near Metro Station",
    price: 25000000,
    size: 5000,
    financialPrice: 25000000,
    priceUnit: "total",
    securityDeposit: 0,
    maintenanceCharges: 0,
    rentalYield: 8,
    capRate: 7,
    escalation: "5% yearly",
    specSize: 5000,
    sizeUnit: "sqft",
    floors: 5,
    totalFloors: 12,
    furnishing: "Fully Furnished",
    parking: 4,
    cabins: 5,
    workstations: 80,
    meetingRooms: 3,
    pantry: "yes",
    washrooms: 4,
    tenantName: "Sample Tenant",
    tenantIndustry: "Technology",
    leaseExpiry: "2030-12-31",
    lockInPeriod: "36 months",
    reraId: "RERA-123",
    grade: "A",
    occupancy: 95,
    amenities: "Power Backup, Lift, Security",
    highlights: "Metro Connected, Grade A Asset",
    isActive: "yes",
    featured: "no",
    listingStatus: "published",
    image1: "property-1.jpg",
    image2: "property-2.jpg",
    image3: "property-3.jpg",
  };

  const listingSheet = workbook.addWorksheet("Properties", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  listingSheet.columns = TEMPLATE_COLUMNS.map((column) => ({
    header: column,
    key: column,
    width: TEMPLATE_COLUMN_WIDTHS[column] || 16,
  }));
  listingSheet.addRow(sampleRow);
  listingSheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
  });
  listingSheet.getRow(1).height = 24;
  listingSheet.getRow(2).alignment = { vertical: "top", wrapText: true };

  const instructions = [
    ["Instructions"],
    ["Fill one property per row in the Properties sheet."],
    ["Upload this Excel file together with a ZIP containing all referenced image files."],
    ["image1, image2, and image3 must exactly match filenames inside the ZIP."],
    ["Comma-separated fields: amenities, highlights."],
    [`type: ${ENUMS.type.join(", ")}`],
    [`status: ${ENUMS.status.join(", ")}`],
    [`priceUnit: ${ENUMS.priceUnit.join(", ")}`],
    [`sizeUnit: ${ENUMS.sizeUnit.join(", ")}`],
    [`furnishing: ${ENUMS.furnishing.join(", ")}`],
    [`grade: ${ENUMS.grade.join(", ")}`],
    [`listingStatus: ${ENUMS.listingStatus.join(", ")}`],
    ["Boolean values can be yes/no, true/false, or 1/0."],
  ];
  const instructionSheet = workbook.addWorksheet("Instructions");
  instructions.forEach((row) => instructionSheet.addRow(row));
  instructionSheet.getColumn(1).width = 110;
  instructionSheet.getRow(1).font = { bold: true, size: 14 };
  instructionSheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });

  return workbook.xlsx.writeBuffer();
}

const bulkPropertyService = {
  generateTemplate,

  async importProperties({ excelFile, zipFile, user }) {
    const rows = parseWorkbookRows(excelFile);
    const imageMap = await buildImageMap(zipFile);
    const results = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const mapped = rowToProperty(row, imageMap);

      if (mapped.errors?.length) {
        results.push({ row: rowNumber, success: false, errors: mapped.errors });
        continue;
      }

      try {
        const property = await propertyService.create(mapped.property, user);
        results.push({
          row: rowNumber,
          success: true,
          propertyId: property._id,
          title: property.title,
        });
      } catch (error) {
        results.push({
          row: rowNumber,
          success: false,
          errors: [error.message || "Unable to create property"],
        });
      }
    }

    return {
      totalRows: rows.length,
      createdCount: results.filter((result) => result.success).length,
      failedCount: results.filter((result) => !result.success).length,
      results,
    };
  },
};

module.exports = bulkPropertyService;
