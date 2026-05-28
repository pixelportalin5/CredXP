const enquiryService = require("../services/enquiryService");

const createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await enquiryService.create(req.body);
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

module.exports = {
  createEnquiry,
  getSellerEnquiries,
};
