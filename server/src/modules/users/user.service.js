const User = require("./user.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Get all roles for dropdown selection
const getRoles = async () => {
  const Role = mongoose.model("Role");
  return await Role.find({ isActive: true }).sort({ name: 1 });
};

// Get all users
const getAllUsers = async () => {
  const users = await User.find()
    .select("-password")
    .populate("role", "name permissions")
    .sort({ createdAt: -1 });

  return users;
};

// Get single user
const getUserById = async (id) => {
  const user = await User.findById(id)
    .select("-password")
    .populate("role", "name permissions");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Create user
const createUser = async (data) => {
  const existingUser = await User.findOne({
    email: data.email.toLowerCase().trim(),
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const user = await User.create(data);

  const safeUser = await User.findById(user._id)
    .select("-password")
    .populate("role", "name permissions");

  return safeUser;
};

// Update user (properly hashes password if a new password is provided)
const updateUser = async (id, data) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  // Check email collision if changing email
  if (data.email && data.email.toLowerCase().trim() !== user.email) {
    const emailExists = await User.findOne({
      email: data.email.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (emailExists) {
      throw new Error("Email is already taken by another account");
    }
    user.email = data.email.toLowerCase().trim();
  }

  if (data.firstName) user.firstName = data.firstName.trim();
  if (data.lastName) user.lastName = data.lastName.trim();
  if (data.phone !== undefined) user.phone = data.phone.trim();
  if (data.role) user.role = data.role;
  if (data.isActive !== undefined) user.isActive = data.isActive;

  // Hash new password if updated
  if (data.password && data.password.trim().length >= 6) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(data.password.trim(), salt);
  }

  await user.save();

  return await User.findById(id)
    .select("-password")
    .populate("role", "name permissions");
};

// Change active status
const updateUserStatus = async (id, status) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: status },
    { new: true }
  )
    .select("-password")
    .populate("role", "name permissions");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Delete user
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

module.exports = {
  getRoles,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
};