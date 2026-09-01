const express = require("express");
const router = express.Router();

const {
  getRoles,
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateStatus,
  deleteUser,
} = require("./user.controller");

const protect = require("../../middleware/auth.middleware");
const permission = require("../../middleware/permission.middleware");

// Get active roles for dropdown selection
router.get("/roles", protect, permission("users.manage"), getRoles);

// User CRUD endpoints
router.get("/", protect, permission("users.manage"), getUsers);
router.get("/:id", protect, permission("users.manage"), getUser);
router.post("/", protect, permission("users.manage"), createUser);
router.put("/:id", protect, permission("users.manage"), updateUser);
router.patch("/:id/status", protect, permission("users.manage"), updateStatus);
router.delete("/:id", protect, permission("users.manage"), deleteUser);

module.exports = router;