const express = require("express");
const router = express.Router();
const { register, login, me } = require("./auth.controller");
const protect = require("../../middleware/auth.middleware");

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route is fully functional",
  });
});

// Authentication endpoints
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);

module.exports = router;