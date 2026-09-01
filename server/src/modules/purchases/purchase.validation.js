const { body } = require("express-validator");


const createPurchaseValidation = [

    body("supplier")
        .notEmpty()
        .withMessage("Supplier is required"),

    body("items")
        .isArray({ min: 1 })
        .withMessage("At least one purchase item is required"),

    body("items.*.product")
        .notEmpty()
        .withMessage("Product is required"),

    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be greater than zero"),

    body("items.*.purchasePrice")
        .isFloat({ min: 0 })
        .withMessage("Purchase price must be a valid number"),

    body("tax")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Tax must be a valid number"),

    body("discount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Discount must be a valid number")

];


module.exports = {
    createPurchaseValidation
};