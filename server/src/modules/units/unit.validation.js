const { body } = require("express-validator");


const createUnitValidation = [

    body("name")
        .notEmpty()
        .withMessage("Unit name is required"),


    body("shortName")
        .notEmpty()
        .withMessage("Short name is required")

];


module.exports = {

    createUnitValidation

};