const express = require("express");
const {
  getSummary,
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
} = require("../controllers/adminController");
const { protect, authorizeEmployee } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorizeEmployee);

router.get("/summary", getSummary);
router.get("/enquiries", getEnquiries);
router.patch("/enquiries/:id/status", updateEnquiryStatus);
router.get("/logs", getLogs);
router.get("/properties", getProperties);
router.post("/properties", createProperty);
router.patch("/properties/:id", updateProperty);
router.delete("/properties/:id", deleteProperty);
router.get("/coworking", getCoworkingSpaces);
router.post("/coworking", createCoworkingSpace);
router.patch("/coworking/:id", updateCoworkingSpace);
router.delete("/coworking/:id", deleteCoworkingSpace);

module.exports = router;
