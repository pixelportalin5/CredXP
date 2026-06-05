const coworkingService = require("../services/coworkingService");
const ApiError = require("../utils/ApiError");

const getCoworkingSpaces = async (req, res, next) => {
  try {
    const result = await coworkingService.getAll(req.query);
    res.json({ success: true, data: result.spaces, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const getCoworkingSpaceById = async (req, res, next) => {
  try {
    const space = await coworkingService.getById(req.params.id);
    if (!space) {
      throw new ApiError(404, "Coworking space not found");
    }
    res.json({ success: true, data: space });
  } catch (error) {
    next(error);
  }
};

const createCoworkingSpace = async (req, res, next) => {
  try {
    const space = await coworkingService.create(req.body, req.user._id);
    res.status(201).json({ success: true, data: space });
  } catch (error) {
    next(error);
  }
};

const getSellerCoworkingSpaces = async (req, res, next) => {
  try {
    const spaces = await coworkingService.getSellerSpaces(req.user._id);
    res.json({ success: true, data: spaces });
  } catch (error) {
    next(error);
  }
};

const updateCoworkingSpace = async (req, res, next) => {
  try {
    const space = await coworkingService.updateById(req.params.id, req.body, req.user);
    res.json({ success: true, data: space });
  } catch (error) {
    next(error);
  }
};

const deleteCoworkingSpace = async (req, res, next) => {
  try {
    const result = await coworkingService.deleteById(req.params.id, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoworkingSpaces,
  getCoworkingSpaceById,
  createCoworkingSpace,
  getSellerCoworkingSpaces,
  updateCoworkingSpace,
  deleteCoworkingSpace,
};
