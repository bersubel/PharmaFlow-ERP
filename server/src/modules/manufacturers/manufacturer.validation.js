const { body } = require("express-validator");


const createManufacturerValidation = [

    body("name")
        .notEmpty()
        .withMessage("Manufacturer name is required")

];


module.exports = {

    createManufacturerValidation

};