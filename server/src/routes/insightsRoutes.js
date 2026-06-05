const express = require("express");
const { fetchInsights } = require("../services/insightsService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 20);
    const data = await fetchInsights(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
