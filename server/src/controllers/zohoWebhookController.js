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

function asBoolean(value) {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  return ["true", "yes", "1", "y"].includes(normalized);
}

/**
 * @desc   Zoho CRM webhook — create/update property on the website
 * @route  POST /api/integrations/zoho/webhook
 *
 * Expected body: { zohoId, title, price, type, description, publishToWebsite }
 */
const handleZohoPropertyWebhook = async (req, res, next) => {
  try {
    const { zohoId, title, price, type, description, publishToWebsite } = req.body || {};

    if (!zohoId || !title) {
      return res.status(400).json({
        success: false,
        message: "zohoId and title are required",
      });
    }

    const resolvedType = ALLOWED_TYPES.has(String(type))
      ? String(type)
      : "Office Space";

    const listingStatus = asBoolean(publishToWebsite) ? "published" : "draft";

    const update = {
      zohoId: String(zohoId).trim(),
      title: String(title).trim(),
      price: Number(price) || 0,
      type: resolvedType,
      description: description
        ? String(description).trim()
        : `${String(title).trim()} — synced from Zoho CRM.`,
      listingStatus,
      isActive: listingStatus === "published",
      zohoLastSync: new Date(),
      // Required schema fields — defaults used when Zoho does not send them
      size: Number(req.body?.size) || 0,
      location: {
        address: req.body?.address || req.body?.location?.address || "Address TBD",
        city: req.body?.city || req.body?.location?.city || "Gurugram",
        state: req.body?.state || req.body?.location?.state || "Haryana",
      },
      financials: {
        price: Number(price) || 0,
        priceUnit: "total",
      },
      specs: {
        size: Number(req.body?.size) || 0,
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

    console.log("Zoho Property Synced:", updatedProperty);

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
