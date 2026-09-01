const express = require("express");

const router = express.Router();


const protect = require("../../middleware/auth.middleware");

const permission = require("../../middleware/permission.middleware");



const {

    getManufacturers,

    getManufacturer,

    createManufacturer,

    updateManufacturer,

    updateStatus,

    deleteManufacturer

} = require("./manufacturer.controller");



const {

    createManufacturerValidation

} = require("./manufacturer.validation");



const {

    validationResult

} = require("express-validator");





const validate = (req,res,next)=>{


    const errors = validationResult(req);



    if(!errors.isEmpty()){


        return res.status(400).json({

            success:false,

            errors:errors.array()

        });


    }



    next();


};





router.get(

    "/",

    protect,

    getManufacturers

);



router.get(

    "/:id",

    protect,

    getManufacturer

);



router.post(

    "/",

    protect,

    permission("products.manage"),

    createManufacturerValidation,

    validate,

    createManufacturer

);



router.put(

    "/:id",

    protect,

    permission("products.manage"),

    updateManufacturer

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

    deleteManufacturer

);



module.exports = router;