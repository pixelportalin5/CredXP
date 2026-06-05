const adminService = require("../services/adminService");

const getSummary = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.summary() });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.listUsers(req.query) });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.updateUser(req.user, req.params.id, req.body) });
  } catch (error) {
    next(error);
  }
};

const getEnquiries = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.listEnquiries(req.query) });
  } catch (error) {
    next(error);
  }
};

const updateEnquiryStatus = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.updateEnquiryStatus(req.user, req.params.id, req.body.status) });
  } catch (error) {
    next(error);
  }
};

const getLogs = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.listLogs() });
  } catch (error) {
    next(error);
  }
};

const getProperties = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.listProperties(req.query) });
  } catch (error) {
    next(error);
  }
};

const createProperty = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await adminService.createProperty(req.user, req.body) });
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.updateProperty(req.user, req.params.id, req.body) });
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.deleteProperty(req.user, req.params.id) });
  } catch (error) {
    next(error);
  }
};

const getCoworkingSpaces = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.listCoworkingSpaces(req.query) });
  } catch (error) {
    next(error);
  }
};

const createCoworkingSpace = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await adminService.createCoworkingSpace(req.user, req.body) });
  } catch (error) {
    next(error);
  }
};

const updateCoworkingSpace = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.updateCoworkingSpace(req.user, req.params.id, req.body) });
  } catch (error) {
    next(error);
  }
};

const deleteCoworkingSpace = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.deleteCoworkingSpace(req.user, req.params.id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getUsers,
  updateUser,
  getEnquiries,
  updateEnquiryStatus,
  getLogs,
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getCoworkingSpaces,
  createCoworkingSpace,
  updateCoworkingSpace,
  deleteCoworkingSpace,
};
