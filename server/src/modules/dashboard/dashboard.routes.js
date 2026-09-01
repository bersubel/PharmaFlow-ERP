const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const { getDashboardStats } = require("./dashboard.controller");

// Route is protected for all authenticated staff members
router.get("/", protect, getDashboardStats);

module.exports = router;