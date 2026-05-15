const propertyService = require("../services/propertyService");
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
    const property = await propertyService.create(req.body);
    res.status(201).json({ success: true, data: property });
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
};
