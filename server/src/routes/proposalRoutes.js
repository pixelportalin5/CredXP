const express = require("express");
const { getPublicProposal } = require("../controllers/proposalController");

const router = express.Router();

router.get("/:id/public", getPublicProposal);

module.exports = router;
