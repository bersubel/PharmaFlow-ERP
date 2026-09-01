const express = require("express");

const router =
    express.Router();


const protect =
    require("../../middleware/auth.middleware");


const permission =
    require("../../middleware/permission.middleware");


const {

    createCustomer,

    getCustomers,

    getCustomer,

    updateCustomer,

    updateStatus,

    deleteCustomer

} = require("./customer.controller");


const {

    createCustomerValidation

} = require("./customer.validation");


const {

    validationResult

} = require("express-validator");


const validate = (
    req,
    res,
    next
) => {

    const errors =
        validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({

            success: false,

            errors:
                errors.array()

        });

    }

    next();

};


router.get(
    "/",
    protect,
    getCustomers
);


router.get(
    "/:id",
    protect,
    getCustomer
);


router.post(
    "/",
    protect,
    permission("sales.manage"),
    createCustomerValidation,
    validate,
    createCustomer
);


router.put(
    "/:id",
    protect,
    permission("sales.manage"),
    updateCustomer
);


router.patch(
    "/:id/status",
    protect,
    permission("sales.manage"),
    updateStatus
);


router.delete(
    "/:id",
    protect,
    permission("sales.manage"),
    deleteCustomer
);


module.exports = router;