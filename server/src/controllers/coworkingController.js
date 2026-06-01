const coworkingService = require("../services/coworkingService");
const ApiError = require("../utils/ApiError");

const getCoworkingSpaces = async (req, res, next) => {
  try {
    const spaces = await coworkingService.getAll();
    res.json({ success: true, data: spaces });
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

module.exports = {
  getCoworkingSpaces,
  getCoworkingSpaceById,
};
