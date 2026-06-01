const express = require("express");
const {
  getCoworkingSpaces,
  getCoworkingSpaceById,
} = require("../controllers/coworkingController");

const router = express.Router();

router.get("/", getCoworkingSpaces);
router.get("/:id", getCoworkingSpaceById);

module.exports = router;
