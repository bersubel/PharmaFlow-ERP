const {
  registerUser,
  loginUser,
  getProfile,
} = require("./auth.service");

// ===============================
// Register Controller
// ===============================
const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: result.token,
      user: result.user,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// ===============================
// Login Controller
// ===============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    // Provide token and user directly + inside data for full compatibility
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
      data: result,
    });
  } catch (error) {
  console.error("LOGIN ERROR:", error);

  return res.status(401).json({
    success: false,
    message: error.message || "Authentication failed",
  });
}
};

// ===============================
// Get Current User
// ===============================
const me = async (req, res) => {
  try {
    const user = await getProfile(req.user._id);

    return res.status(200).json({
      success: true,
      data: user,
      user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Profile not found",
    });
  }
};

module.exports = {
  register,
  login,
  me,
};