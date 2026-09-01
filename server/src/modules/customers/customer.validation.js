const { body } = require("express-validator");


const createCustomerValidation = [

    body("firstName")
        .notEmpty()
        .withMessage("First name is required")
        .trim(),

    body("lastName")
        .notEmpty()
        .withMessage("Last name is required")
        .trim(),

    body("phone")
        .notEmpty()
        .withMessage("Phone number is required")
        .trim(),

    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address"),

    body("address")
        .optional()
        .trim()

];


module.exports = {
    createCustomerValidation
};