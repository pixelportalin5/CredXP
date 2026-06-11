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

  async list({ limit = 50 } = {}) {
    return ContactMessage.find().sort({ createdAt: -1 }).limit(limit).lean();
  },

  async getById(id) {
    return ContactMessage.findById(id).lean();
  },

  async update(id, data) {
    return ContactMessage.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  },

  async delete(id) {
    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) return null;
    return { id };
  },
};

module.exports = contactService;
