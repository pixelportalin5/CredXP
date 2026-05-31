const propertyService = require("../services/propertyService");
const bulkPropertyService = require("../services/bulkPropertyService");
const ApiError = require("../utils/ApiError");

/**
 * @desc   Get all properties (with pagination & filters)
 * @route  GET /api/properties
 */
const getProperties = async (req, res, next) => {
  try {
    const result = await propertyService.getAll(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get properties by status (Recently Posted / Trending)
 * @route  GET /api/properties/status/:status
 */
const getPropertiesByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const limit = req.query.limit || 6;
    const properties = await propertyService.getByStatus(status, limit);
    res.json({ success: true, data: properties });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Search properties
 * @route  GET /api/properties/search
 */
const searchProperties = async (req, res, next) => {
  try {
    const result = await propertyService.search(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single property by ID
 * @route  GET /api/properties/:id
 */
const getPropertyById = async (req, res, next) => {
  try {
    const property = await propertyService.getById(req.params.id);

    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create a new property
 * @route  POST /api/properties
 */
const createProperty = async (req, res, next) => {
  try {
    const property = await propertyService.create(req.body, req.user);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Download bulk property upload template
 * @route  GET /api/properties/bulk/template
 */
const downloadBulkTemplate = async (req, res, next) => {
  try {
    const template = await bulkPropertyService.generateTemplate();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=credxp-property-bulk-template.xlsx");
    res.send(template);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Import properties from Excel and image ZIP
 * @route  POST /api/properties/bulk/upload
 */
const bulkUploadProperties = async (req, res, next) => {
  try {
    const excelFile = req.files?.excel?.[0];
    const zipFile = req.files?.imagesZip?.[0];

    if (!excelFile) {
      throw new ApiError(400, "Excel file is required");
    }
    if (!zipFile) {
      throw new ApiError(400, "Images ZIP file is required");
    }

    const result = await bulkPropertyService.importProperties({
      excelFile,
      zipFile,
      user: req.user,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get seller-owned properties
 * @route  GET /api/properties/seller/my-properties
 */
const getSellerProperties = async (req, res, next) => {
  try {
    const properties = await propertyService.getSellerProperties(req.user._id);
    res.json({ success: true, data: properties });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update seller-owned property
 * @route  PUT /api/properties/:id
 */
const updateProperty = async (req, res, next) => {
  try {
    const property = await propertyService.updateByOwner(req.params.id, req.body, req.user);
    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete seller-owned property
 * @route  DELETE /api/properties/:id
 */
const deleteProperty = async (req, res, next) => {
  try {
    const result = await propertyService.deleteByOwner(req.params.id, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertiesByStatus,
  searchProperties,
  getPropertyById,
  createProperty,
  downloadBulkTemplate,
  bulkUploadProperties,
  getSellerProperties,
  updateProperty,
  deleteProperty,
};
