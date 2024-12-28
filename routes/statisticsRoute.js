const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { getStatistics } = require("../controllers/statisticsController");

// Endpoint Statistik
router.get("/", protect, admin, getStatistics);

module.exports = router;
