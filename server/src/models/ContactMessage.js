const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      match: [/^\d{8,15}$/, "Phone must contain 8 to 15 digits"],
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
    },
    enquiryType: {
      type: String,
      required: [true, "Enquiry type is required"],
      enum: ["Investment Advisory", "Office Leasing", "Coworking", "Partnership", "General Enquiry"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
