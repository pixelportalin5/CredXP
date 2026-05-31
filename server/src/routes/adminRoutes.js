const express = require("express");
const {
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
} = require("../controllers/adminController");
const { protect, authorizeAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorizeAdmin);

router.get("/summary", getSummary);
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.get("/enquiries", getEnquiries);
router.patch("/enquiries/:id/status", updateEnquiryStatus);
router.get("/logs", getLogs);
router.get("/properties", getProperties);
router.post("/properties", createProperty);
router.patch("/properties/:id", updateProperty);
router.delete("/properties/:id", deleteProperty);

module.exports = router;
