const { body } = require("express-validator");


const createSaleValidation = [

    body("customer")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Customer ID must be valid"),


    body("items")
        .isArray({ min: 1 })
        .withMessage(
            "At least one sale item is required"
        ),


    body("items.*.product")
        .notEmpty()
        .withMessage(
            "Product is required"
        )
        .isMongoId()
        .withMessage(
            "Product ID must be valid"
        ),


    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage(
            "Quantity must be greater than zero"
        ),


    body("items.*.sellingPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage(
            "Selling price must be a valid number"
        ),


    body("tax")
        .optional()
        .isFloat({ min: 0 })
        .withMessage(
            "Tax must be a valid number"
        ),


    body("discount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage(
            "Discount must be a valid number"
        ),


    body("paymentMethod")
        .optional()
        .isIn([
            "CASH",
            "CARD",
            "TRANSFER",
            "CREDIT"
        ])
        .withMessage(
            "Invalid payment method"
        ),


    body("paymentStatus")
        .optional()
        .isIn([
            "PAID",
            "PARTIAL",
            "UNPAID"
        ])
        .withMessage(
            "Invalid payment status"
        )

];


module.exports = {
    createSaleValidation
};