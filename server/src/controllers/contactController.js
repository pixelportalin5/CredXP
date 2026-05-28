const contactService = require("../services/contactService");

const createContactMessage = async (req, res, next) => {
  try {
    const message = await contactService.create(req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactMessage,
};
