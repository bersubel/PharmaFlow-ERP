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


    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });


  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};




// ===============================
// Login Controller
// ===============================
const login = async (req, res) => {

  try {

    console.log("LOGIN CONTROLLER START");


    const { email, password } = req.body;


    console.log("EMAIL:", email);


    const result = await loginUser(
      email,
      password
    );


    console.log("LOGIN SERVICE FINISHED");


    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });


  } catch (error) {

    console.log("LOGIN ERROR:", error.message);


    res.status(401).json({
      success: false,
      message: error.message,
    });

  }

};




// ===============================
// Get Current User
// ===============================
const me = async (req, res) => {

  try {

    const user = await getProfile(
      req.user._id
    );


    res.status(200).json({
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



module.exports = {
  register,
  login,
  me,
};