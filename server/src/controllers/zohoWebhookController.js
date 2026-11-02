const {
  upsertPropertyFromZoho,
  importAllFromZoho,
  getSyncStatus,
} = require("../services/zohoPropertySyncService");

function summarize(property) {
  return {
    id: property._id ? String(property._id) : undefined,
    title: property.title,
    type: property.type,
    priceUnit: property.financials?.priceUnit,
    listingStatus: property.listingStatus,
    isActive: property.isActive,
  };
}

/**
 * @desc   Zoho CRM webhook: create/update one listing
 * @route  POST /api/integrations/zoho/webhook
 * Body: the Zoho record (any of the field names the mapper understands), or
 * just its id when the Zoho API is configured; the full record is fetched.
 */
const handleZohoPropertyWebhook = async (req, res, next) => {
  try {
    const { property, created } = await upsertPropertyFromZoho(req.body || {}, { fetchFullRecord: true });
    console.log(`[Zoho Webhook] ${created ? "created" : "updated"}:`, summarize(property));
    return res.status(200).json({
      success: true,
      message: created ? "Property created from Zoho CRM" : "Property updated from Zoho CRM",
      data: summarize(property),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc   Pull every Zoho property record into the website
 * @route  POST /api/integrations/zoho/import   (admin)
 */
const importFromZoho = async (req, res, next) => {
  try {
    const summary = await importAllFromZoho({ trigger: `admin:${req.user?.email || "unknown"}` });
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc   Zoho sync setup and last import result
 * @route  GET /api/integrations/zoho/status   (admin)
 */
const zohoSyncStatus = (req, res) => res.status(200).json({ success: true, data: getSyncStatus() });

module.exports = {
  handleZohoPropertyWebhook,
  importFromZoho,
  zohoSyncStatus,
};
