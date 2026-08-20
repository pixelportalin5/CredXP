const Property = require("../models/Property");
const { invalidatePrefix } = require("../utils/queryCache");

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

const INVESTMENT_TYPES = new Set(["Pre-Leased Office", "Shop", "Retail/SCO"]);
const LEASE_TYPES = new Set(["Office Space", "Shop"]);

function asBoolean(value) {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  return ["true", "yes", "1", "y"].includes(normalized);
}

function pick(body, keys) {
  for (const key of keys) {
    const value = body?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return undefined;
}

function normalizeType(rawType) {
  const candidate = String(rawType || "").trim();
  if (ALLOWED_TYPES.has(candidate)) return candidate;

  const lower = candidate.toLowerCase();
  if (lower.includes("pre-leased") || lower.includes("pre leased") || lower.includes("investment")) {
    return "Pre-Leased Office";
  }
  if (lower.includes("retail") || lower.includes("sco")) return "Retail/SCO";
  if (lower.includes("shop")) return "Shop";
  if (lower.includes("warehouse")) return "Warehouse";
  if (lower.includes("cowork")) return "Coworking Space";
  if (lower.includes("land")) return "Commercial Land";
  if (lower.includes("office") || lower.includes("lease") || lower.includes("rent")) {
    return "Office Space";
  }

  // CredXP primary inventory is investment/pre-leased
  return "Pre-Leased Office";
}

function resolvePriceUnit(type, rawUnit) {
  const unit = String(rawUnit || "").trim().toLowerCase();
  if (["month", "year", "sqft", "total"].includes(unit)) return unit;

  // Lease listings must use month/year or /lease filters hide them.
  // Investment listings must NOT use month/year or /invest filters hide them.
  if (type === "Office Space") return "month";
  return "total";
}

/**
 * @desc   Zoho CRM webhook — create/update property on the website
 * @route  POST /api/integrations/zoho/webhook
 *
 * Expected body (flexible field names supported):
 * { zohoId, title, price, type, description, publishToWebsite }
 */
const handleZohoPropertyWebhook = async (req, res, next) => {
  try {
    const body = req.body || {};

    const zohoId = pick(body, ["zohoId", "id", "Id", "Record_Id", "record_id"]);
    const title = pick(body, ["title", "Title", "Name", "Property_Name"]);
    const price = pick(body, ["price", "Price", "Asking_Price", "Sale_Price"]);
    const typeRaw = pick(body, ["type", "Type", "Property_Type", "Listing_Type"]);
    const description = pick(body, ["description", "Description", "Property_Description"]);
    const publishToWebsite = pick(body, [
      "publishToWebsite",
      "Publish_to_Website",
      "Publish_To_Website",
      "publish_to_website",
    ]);

    if (!zohoId || !title) {
      return res.status(400).json({
        success: false,
        message: "zohoId and title are required",
      });
    }

    const resolvedType = normalizeType(typeRaw);
    const priceUnit = resolvePriceUnit(
      resolvedType,
      pick(body, ["priceUnit", "Price_Unit", "financials.priceUnit"])
    );

    // Default to published so Zoho listings appear unless explicitly unpublished
    const shouldPublish =
      publishToWebsite === undefined ? true : asBoolean(publishToWebsite);
    const listingStatus = shouldPublish ? "published" : "draft";

    const numericPrice = Number(String(price ?? "").replace(/,/g, "")) || 0;
    const numericSize =
      Number(String(pick(body, ["size", "Size", "Area", "Built_Up_Area"]) ?? "").replace(/,/g, "")) ||
      0;

    const update = {
      zohoId: String(zohoId).trim(),
      title: String(title).trim(),
      price: numericPrice,
      type: resolvedType,
      description: description
        ? String(description).trim()
        : `${String(title).trim()} — synced from Zoho CRM.`,
      listingStatus,
      isActive: listingStatus === "published",
      zohoLastSync: new Date(),
      size: numericSize,
      location: {
        address:
          pick(body, ["address", "Address", "Location_Address"]) || "Address TBD",
        city: pick(body, ["city", "City", "Location_City"]) || "Gurugram",
        state: pick(body, ["state", "State", "Location_State"]) || "Haryana",
      },
      financials: {
        price: numericPrice,
        priceUnit,
      },
      specs: {
        size: numericSize,
        sizeUnit: "sqft",
      },
    };

    const updatedProperty = await Property.findOneAndUpdate(
      { zohoId: update.zohoId },
      { $set: update },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("Zoho Property Synced:", {
      id: updatedProperty._id,
      zohoId: updatedProperty.zohoId,
      title: updatedProperty.title,
      type: updatedProperty.type,
      priceUnit: updatedProperty.financials?.priceUnit,
      listingStatus: updatedProperty.listingStatus,
      visibleOnInvest: INVESTMENT_TYPES.has(updatedProperty.type) &&
        !["month", "year"].includes(updatedProperty.financials?.priceUnit),
      visibleOnLease:
        LEASE_TYPES.has(updatedProperty.type) &&
        ["month", "year"].includes(updatedProperty.financials?.priceUnit),
    });

    invalidatePrefix("properties");

    return res.status(200).json({
      success: true,
      message: "Property synced from Zoho CRM",
      data: updatedProperty,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  handleZohoPropertyWebhook,
};
