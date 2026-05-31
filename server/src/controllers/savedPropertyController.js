const savedPropertyService = require("../services/savedPropertyService");

const getSavedProperties = async (req, res, next) => {
  try {
    const properties = await savedPropertyService.list(req.user._id);
    res.json({ success: true, data: properties });
  } catch (error) {
    next(error);
  }
};

const saveProperty = async (req, res, next) => {
  try {
    const property = await savedPropertyService.save(req.user._id, req.params.propertyId);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

const removeSavedProperty = async (req, res, next) => {
  try {
    const result = await savedPropertyService.remove(req.user._id, req.params.propertyId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSavedProperties,
  saveProperty,
  removeSavedProperty,
};
