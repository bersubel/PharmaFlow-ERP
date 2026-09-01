const { body } = require("express-validator");

const createSupplierValidation = [

    body("companyName")
        .notEmpty()
        .withMessage("Company name is required"),

    body("contactPerson")
        .notEmpty()
        .withMessage("Contact person is required"),

    body("email")
        .isEmail()
        .withMessage("Valid email is required"),

    body("phone")
        .notEmpty()
        .withMessage("Phone number is required")

];

module.exports = {
    createSupplierValidation
};