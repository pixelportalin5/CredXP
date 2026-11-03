const contactService = require("../services/contactService");
const { notifyContact, notifyNewsletter } = require("../services/inquiryEmailService");
const ApiError = require("../utils/ApiError");

const createContactMessage = async (req, res, next) => {
  try {
    const message = await contactService.create(req.body);
    notifyContact(req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const subscribeNewsletter = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      throw new ApiError(400, "Please provide a valid email");
    }
    notifyNewsletter(email);
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactMessage,
  subscribeNewsletter,
};
