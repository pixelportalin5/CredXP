const express = require("express");
const {
  createProposal,
  listProposals,
  getProposal,
  updateProposal,
  deleteProposal,
  generateProposalPdf,
} = require("../controllers/proposalController");
const { protect } = require("../middleware/authMiddleware");

function buildStaffProposalRoutes(authorize) {
  const router = express.Router();
  router.use(protect, authorize);
  router.post("/", createProposal);
  router.post("/pdf", generateProposalPdf);
  router.get("/", listProposals);
  router.get("/:id", getProposal);
  router.put("/:id", updateProposal);
  router.delete("/:id", deleteProposal);
  return router;
}

module.exports = buildStaffProposalRoutes;
