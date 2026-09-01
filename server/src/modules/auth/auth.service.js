const bcrypt = require("bcryptjs");
const User = require("../users/user.model");
const Role = require("../roles/role.model");
const generateToken = require("../../utils/generateToken");

// ===============================
// Register New User
// ===============================
const registerUser = async (userData) => {
  const { firstName, lastName, email, password, phone, role } = userData;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check existing user
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Find role
  let userRole = null;
  if (role) {
    userRole = await Role.findOne({
      name: { $regex: new RegExp(`^${role.trim()}$`, "i") },
    });
  }

  if (!userRole) {
    userRole = await Role.findOne({ name: "Cashier" });
  }

  if (!userRole) {
    throw new Error("Specified role not found in system");
  }

  // Create user
  const user = await User.create({
    firstName: firstName ? firstName.trim() : "",
    lastName: lastName ? lastName.trim() : "",
    email: normalizedEmail,
    password: String(password).trim(),
    phone: phone ? phone.trim() : "",
    role: userRole._id,
  });

  // Generate token
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: userRole.name,
      permissions: userRole.permissions || [],
    },
    token,
  };
};

// ===============================
// Login User
// ===============================
const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const rawPassword = String(password).trim();

  // 1. Find user with hidden password and populated role
  const user = await User.findOne({ email: normalizedEmail })
    .select("+password")
    .populate("role");

  if (!user) {
    console.log(`[AUTH-DEBUG] User not found: ${normalizedEmail}`);
    throw new Error("Invalid email or password");
  }

  // 2. Check active status
  if (user.isActive === false) {
    throw new Error("Your account has been deactivated. Please contact an administrator.");
  }

  // 3. Verify password
  let isMatch = false;

  console.log("========== LOGIN DEBUG ==========");
  console.log("Email:", normalizedEmail);
  console.log("Password received:", Boolean(rawPassword));
  console.log("Password length:", rawPassword.length);
  console.log("Stored hash exists:", Boolean(user.password));
  console.log("Stored hash prefix:", user.password ? user.password.substring(0, 7) : "NONE");
  console.log("Stored hash length:", user.password ? user.password.length : 0);

  if (user.password) {
    // Direct bcrypt compare guarantees standard resolution regardless of schema hooks
    isMatch = await bcrypt.compare(rawPassword, user.password);
  }

  console.log("Password match:", isMatch);
  console.log("================================");

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // 4. Update last login timestamp without re-running document pre-save validators
  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
  });

  // 5. Safe role and permission extraction
  const roleName = user.role?.name || (typeof user.role === "string" ? user.role : "Staff");
  const permissions = Array.isArray(user.role?.permissions) ? user.role.permissions : [];

  // 6. Generate auth token
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: roleName,
      permissions,
    },
    token,
  };
};

// ===============================
// Get Current User Profile
// ===============================
const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .select("-password")
    .populate("role");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};