const express = require("express");

const router = express.Router();


const {
  register,
  login,
  me,
} = require("./auth.controller");


const protect = require("../../middleware/auth.middleware");


const {
  registerValidation,
  loginValidation,
} = require("./auth.validation");


const {
  validationResult,
} = require("express-validator");




// Validation middleware

const validate = (req,res,next)=>{

    const errors = validationResult(req);


    if(!errors.isEmpty()){

        return res.status(400).json({
            success:false,
            errors:errors.array()
        });

    }


    next();

};





// Routes


router.post(
    "/register",
    registerValidation,
    validate,
    register
);


router.get("/test", (req,res)=>{
    res.json({
        message:"Auth route works"
    });
});
router.post(
    "/login",
    loginValidation,
    validate,
    login
);



router.get(
    "/me",
    protect,
    me
);



module.exports = router;