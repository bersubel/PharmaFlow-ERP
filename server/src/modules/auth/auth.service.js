const User = require("../users/user.model");
const Role = require("../roles/role.model");
const generateToken = require("../../utils/generateToken");


// ===============================
// Register New User
// ===============================
const registerUser = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
  } = userData;


  // Check existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already registered");
  }


  // Find role
  const userRole = await Role.findOne({
    name: role || "Cashier",
  });


  if (!userRole) {
    throw new Error("Role not found");
  }


  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    role: userRole._id,
  });


  // Generate token
  const token = generateToken(user._id);


  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: userRole.name,
    },
    token,
  };
};



// ===============================
// Login User
// ===============================
const loginUser = async (email, password) => {

  console.log("1 - SERVICE START");


  const user = await User.findOne({ email })
    .select("+password")
    .populate("role");


  console.log("2 - USER FOUND");



  if (!user) {

    console.log("NO USER");

    throw new Error(
      "Invalid email or password"
    );

  }



  console.log("3 - CHECK PASSWORD");



  const isMatch = await user.comparePassword(password);



  console.log(
    "4 - PASSWORD RESULT:",
    isMatch
  );



  if (!isMatch) {

    throw new Error(
      "Invalid email or password"
    );

  }



  console.log("5 - UPDATE LOGIN");



  await User.findByIdAndUpdate(
    user._id,
    {
      lastLogin:new Date()
    }
  );



  console.log("6 - GENERATE TOKEN");



  const token = generateToken(
    user._id
  );



  console.log("7 - COMPLETE");



  return {

    user:{
      id:user._id,
      firstName:user.firstName,
      lastName:user.lastName,
      email:user.email,
      role:user.role.name,
      permissions:user.role.permissions
    },

    token

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