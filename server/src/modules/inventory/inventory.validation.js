const { body } = require("express-validator");

const createInventoryValidation = [

    body("product")
        .notEmpty()
        .withMessage("Product is required"),

    body("type")
        .isIn(["IN", "OUT"])
        .withMessage("Invalid movement type"),

    body("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be greater than zero")

];

module.exports = {

    createInventoryValidation

};