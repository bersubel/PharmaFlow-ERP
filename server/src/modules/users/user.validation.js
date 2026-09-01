const {
    body
} = require("express-validator");



const createUserValidation = [

    body("firstName")
        .notEmpty()
        .withMessage("First name is required"),


    body("lastName")
        .notEmpty()
        .withMessage("Last name is required"),


    body("email")
        .isEmail()
        .withMessage("Valid email required"),


    body("password")
        .isLength({
            min:6
        })
        .withMessage(
            "Password must be at least 6 characters"
        )

];



module.exports = {

    createUserValidation

};