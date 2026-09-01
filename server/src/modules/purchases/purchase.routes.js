const express = require("express");

const router = express.Router();


const protect =
    require("../../middleware/auth.middleware");


const permission =
    require("../../middleware/permission.middleware");


const {

    createPurchase,

    getPurchases,

    getPurchase,

    updatePurchase,

    receivePurchase,

    cancelPurchase

} = require("./purchase.controller");


const {

    createPurchaseValidation

} = require("./purchase.validation");


const {

    validationResult

} = require("express-validator");


const validate = (req, res, next) => {

    const errors =
        validationResult(req);


    if (!errors.isEmpty()) {

        return res.status(400).json({

            success: false,

            errors: errors.array()

        });

    }


    next();

};


router.get(

    "/",

    protect,

    getPurchases

);


router.get(

    "/:id",

    protect,

    getPurchase

);


router.post(

    "/",

    protect,

    permission("products.manage"),

    createPurchaseValidation,

    validate,

    createPurchase

);


router.put(

    "/:id",

    protect,

    permission("products.manage"),

    updatePurchase

);


router.patch(

    "/:id/receive",

    protect,

    permission("inventory.manage"),

    receivePurchase

);


router.patch(

    "/:id/cancel",

    protect,

    permission("products.manage"),

    cancelPurchase

);


module.exports = router;