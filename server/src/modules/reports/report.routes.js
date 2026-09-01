const express = require("express");

const router =
    express.Router();


const protect =
    require("../../middleware/auth.middleware");


const permission =
    require("../../middleware/permission.middleware");


const {

    getSalesReport,

    getPurchaseReport,

    getInventoryReport,

    getInventoryMovementReport

} = require("./report.controller");


router.get(

    "/sales",

    protect,

    permission("reports.view"),

    getSalesReport

);


router.get(

    "/purchases",

    protect,

    permission("reports.view"),

    getPurchaseReport

);


router.get(

    "/inventory",

    protect,

    permission("reports.view"),

    getInventoryReport

);


router.get(

    "/inventory-movements",

    protect,

    permission("reports.view"),

    getInventoryMovementReport

);


module.exports = router;