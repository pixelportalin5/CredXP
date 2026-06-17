const express = require("express");
const { getPublicProposal, getExportProposalData } = require("../controllers/proposalController");

const router = express.Router();

router.get("/export/:token", getExportProposalData);
router.get("/:id/public", getPublicProposal);

module.exports = router;
