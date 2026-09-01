const { body } = require("express-validator");


const createBrandValidation = [

    body("name")
        .notEmpty()
        .withMessage("Brand name is required")

];


module.exports = {

    createBrandValidation

};