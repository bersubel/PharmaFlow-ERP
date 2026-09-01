const express = require("express");

const router = express.Router();


const protect = require("../../middleware/auth.middleware");

const permission = require("../../middleware/permission.middleware");



const {

    getUnits,

    getUnit,

    createUnit,

    updateUnit,

    updateStatus,

    deleteUnit

}=require("./unit.controller");



const {

    createUnitValidation

}=require("./unit.validation");



const {

    validationResult

}=require("express-validator");




const validate=(req,res,next)=>{


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
    getUnits
);



router.get(
    "/:id",
    protect,
    getUnit
);



router.post(

    "/",

    protect,

    permission("products.manage"),

    createUnitValidation,

    validate,

    createUnit

);



router.put(

    "/:id",

    protect,

    permission("products.manage"),

    updateUnit

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

    deleteUnit

);



module.exports = router;