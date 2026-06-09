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

module.exports = {
  createProposal,
  listProposals,
  getProposal,
  getPublicProposal,
  deleteProposal,
};
