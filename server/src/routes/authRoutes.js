const express = require("express");
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateAuth } = require("../middleware/validateRequest");

const router = express.Router();

router.post("/register", validateAuth("register"), register);
router.post("/login", validateAuth("login"), login);
router.get("/me", protect, me);

module.exports = router;
