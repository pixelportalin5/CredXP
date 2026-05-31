const enquiryService = require("../services/enquiryService");

const createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await enquiryService.create(req.body, req.user);
    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

const getSellerEnquiries = async (req, res, next) => {
  try {
    const enquiries = await enquiryService.getForSeller(req.user._id, req.query);
    res.json({ success: true, data: enquiries });
  } catch (error) {
    next(error);
  }
};

const getMyEnquiries = async (req, res, next) => {
  try {
    const enquiries = await enquiryService.getForUser(req.user._id, req.query);
    res.json({ success: true, data: enquiries });
  } catch (error) {
    next(error);
  }
};

const closeSellerEnquiry = async (req, res, next) => {
  try {
    const enquiry = await enquiryService.closeForSeller(req.user._id, req.params.enquiryId);
    res.json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

const archiveMyEnquiry = async (req, res, next) => {
  try {
    const result = await enquiryService.archiveForUser(req.user._id, req.params.enquiryId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const clearMyEnquiries = async (req, res, next) => {
  try {
    const result = await enquiryService.clearForUser(req.user._id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnquiry,
  getSellerEnquiries,
  getMyEnquiries,
  archiveMyEnquiry,
  clearMyEnquiries,
  closeSellerEnquiry,
};
