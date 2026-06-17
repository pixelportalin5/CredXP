const proposalService = require("../services/proposalService");

const createProposal = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await proposalService.create(req.user, req.body) });
  } catch (error) {
    next(error);
  }
};

const listProposals = async (req, res, next) => {
  try {
    res.json({ success: true, data: await proposalService.listByUser(req.user._id) });
  } catch (error) {
    next(error);
  }
};

const getProposal = async (req, res, next) => {
  try {
    res.json({ success: true, data: await proposalService.getByIdForUser(req.user._id, req.params.id) });
  } catch (error) {
    next(error);
  }
};

const getPublicProposal = async (req, res, next) => {
  try {
    res.json({ success: true, data: await proposalService.getPublic(req.params.id) });
  } catch (error) {
    next(error);
  }
};

const deleteProposal = async (req, res, next) => {
  try {
    res.json({ success: true, data: await proposalService.deleteByUser(req.user._id, req.params.id) });
  } catch (error) {
    next(error);
  }
};

const generateProposalPdf = async (req, res, next) => {
  try {
    const { generateProposalPdf: runPdfGeneration } = require("../services/proposalPdfService");
    const { normalizeProposalForExport } = require("../utils/normalizeProposalForExport");

    let proposal = req.body?.proposal;

    if (!proposal && req.body?.proposalId) {
      proposal = await proposalService.getByIdForUser(req.user._id, req.body.proposalId);
    }

    if (!proposal) {
      return res.status(400).json({ success: false, message: "Proposal data is required." });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const normalized = await normalizeProposalForExport(proposal, clientUrl);
    const { buffer, filename } = await runPdfGeneration(normalized);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const getExportProposalData = async (req, res, next) => {
  try {
    const secret = req.headers["x-pdf-export-secret"];
    if (!process.env.PDF_EXPORT_SECRET || secret !== process.env.PDF_EXPORT_SECRET) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const proposalExportStore = require("../services/proposalExportStore");
    const proposal = proposalExportStore.getExportSession(req.params.token);

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Export session not found or expired." });
    }

    res.json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProposal,
  listProposals,
  getProposal,
  getPublicProposal,
  deleteProposal,
  generateProposalPdf,
  getExportProposalData,
};
