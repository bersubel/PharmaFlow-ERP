const express = require("express");

const router = express.Router();

const protect = require("../../middleware/auth.middleware");

const permission = require("../../middleware/permission.middleware");

const {

    getInventory,

    createMovement,

    getLowStock,

    getExpiringProducts,

    getInventorySummary

} = require("./inventory.controller");

const {

    createInventoryValidation

} = require("./inventory.validation");

const {

    validationResult

} = require("express-validator");

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

router.get(

    "/",

    protect,

    getInventory

);
router.get(

    "/low-stock",

    protect,

    getLowStock

);


router.get(

    "/expiring",

    protect,

    getExpiringProducts

);


router.get(

    "/summary",

    protect,

    getInventorySummary

);
router.post(

    "/",

    protect,

    permission("inventory.manage"),

    createInventoryValidation,

    validate,

    createMovement

);

module.exports = router;