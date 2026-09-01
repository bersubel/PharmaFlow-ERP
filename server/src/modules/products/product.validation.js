const { body } = require("express-validator");
const mongoose = require("mongoose");

const objectIdValidation = (field, message) =>
    body(field)
        .notEmpty()
        .withMessage(message)
        .bail()
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error(`${field} must be a valid ID`);
            }

            return true;
        });

const createProductValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required"),

    body("genericName")
        .optional()
        .trim(),

    body("barcode")
        .optional()
        .trim(),

    objectIdValidation(
        "category",
        "Category is required"
    ),

    body("brand")
        .optional()
        .custom((value) => {
            if (
                value &&
                !mongoose.Types.ObjectId.isValid(value)
            ) {
                throw new Error(
                    "Brand must be a valid ID"
                );
            }

            return true;
        }),

    body("manufacturer")
        .optional()
        .custom((value) => {
            if (
                value &&
                !mongoose.Types.ObjectId.isValid(value)
            ) {
                throw new Error(
                    "Manufacturer must be a valid ID"
                );
            }

            return true;
        }),

    body("supplier")
        .optional()
        .custom((value) => {
            if (
                value &&
                !mongoose.Types.ObjectId.isValid(value)
            ) {
                throw new Error(
                    "Supplier must be a valid ID"
                );
            }

            return true;
        }),

    objectIdValidation(
        "unit",
        "Unit is required"
    ),

    body("purchasePrice")
        .isFloat({
            min: 0,
        })
        .withMessage(
            "Purchase price must be a valid positive number"
        ),

    body("sellingPrice")
        .isFloat({
            min: 0,
        })
        .withMessage(
            "Selling price must be a valid positive number"
        ),

    body("quantity")
        .optional()
        .isFloat({
            min: 0,
        })
        .withMessage(
            "Quantity must be a valid positive number"
        ),

    body("reorderLevel")
        .optional()
        .isFloat({
            min: 0,
        })
        .withMessage(
            "Reorder level must be a valid positive number"
        ),

    body("batchNumber")
        .optional()
        .trim(),

    body("expiryDate")
        .optional()
        .isISO8601()
        .withMessage(
            "Expiry date must be a valid date"
        ),

    body("description")
        .optional()
        .trim(),

];

module.exports = {
    createProductValidation,
};