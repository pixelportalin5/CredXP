const ContactMessage = require("../models/ContactMessage");

const contactService = {
  async create(data) {
    return ContactMessage.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      enquiryType: data.enquiryType,
      message: data.message,
    });
  },
};

module.exports = contactService;
