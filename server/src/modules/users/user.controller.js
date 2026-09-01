const userService = require("./user.service");

// Get roles for dropdowns
exports.getRoles = async (req, res) => {
  try {
    const roles = await userService.getRoles();
    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get users
exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User account created successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({
      success: true,
      message: "User account updated",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  try {
    // Prevent self-deactivation
    if (req.user._id.toString() === req.params.id && req.body.status === false) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own active admin account",
      });
    }

    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.status
    );

    res.json({
      success: true,
      message: `User account is now ${user.isActive ? "Active" : "Inactive"}`,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own active admin account",
      });
    }

    await userService.deleteUser(req.params.id);

    res.json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};