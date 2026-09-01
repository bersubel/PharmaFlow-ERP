const express = require("express");

const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const permission = require("../../middleware/permission.middleware");


const {
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    updateStatus,
    deleteSupplier
} = require("./supplier.controller");


const {
    createSupplierValidation
} = require("./supplier.validation");


const {
    validationResult
} = require("express-validator");



// Validation middleware

const validate = (req, res, next) => {

    const errors = validationResult(req);


    if (!errors.isEmpty()) {

        return res.status(400).json({
            success: false,
            errors: errors.array()
        });

    }


    next();

};



// Routes


router.get(
    "/",
    protect,
    getSuppliers
);


router.get(
    "/:id",
    protect,
    getSupplier
);


router.post(
    "/",
    protect,
    permission("products.manage"),
    createSupplierValidation,
    validate,
    createSupplier
);


router.put(
    "/:id",
    protect,
    permission("products.manage"),
    updateSupplier
);


router.patch(
    "/:id/status",
    protect,
    permission("products.manage"),
    updateStatus
);


router.delete(
    "/:id",
    protect,
    permission("products.manage"),
    deleteSupplier
);



module.exports = router;