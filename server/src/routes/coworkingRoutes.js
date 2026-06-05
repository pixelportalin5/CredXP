const express = require("express");
const {
  getCoworkingSpaces,
  getCoworkingSpaceById,
  createCoworkingSpace,
  getSellerCoworkingSpaces,
  updateCoworkingSpace,
  deleteCoworkingSpace,
} = require("../controllers/coworkingController");
const { protect, authorizeSeller } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCoworkingSpaces);
router.post("/", protect, authorizeSeller, createCoworkingSpace);
router.get("/seller/my-spaces", protect, authorizeSeller, getSellerCoworkingSpaces);
router.get("/:id", getCoworkingSpaceById);
router.put("/:id", protect, authorizeSeller, updateCoworkingSpace);
router.delete("/:id", protect, authorizeSeller, deleteCoworkingSpace);

module.exports = router;
