const express = require("express");
const {
  getSavedProperties,
  saveProperty,
  removeSavedProperty,
} = require("../controllers/savedPropertyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getSavedProperties);
router.post("/:propertyId", saveProperty);
router.delete("/:propertyId", removeSavedProperty);

module.exports = router;
