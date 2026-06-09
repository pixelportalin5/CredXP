const express = require("express");
const {
  createProposal,
  listProposals,
  getProposal,
  deleteProposal,
} = require("../controllers/proposalController");
const { protect } = require("../middleware/authMiddleware");

function buildStaffProposalRoutes(authorize) {
  const router = express.Router();
  router.use(protect, authorize);
  router.post("/", createProposal);
  router.get("/", listProposals);
  router.get("/:id", getProposal);
  router.delete("/:id", deleteProposal);
  return router;
}

module.exports = buildStaffProposalRoutes;
