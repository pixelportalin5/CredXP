const express = require("express");
const { createContactMessage } = require("../controllers/contactController");
const { validateContactMessage } = require("../middleware/validateRequest");

const router = express.Router();

router.post("/", validateContactMessage, createContactMessage);

module.exports = router;
