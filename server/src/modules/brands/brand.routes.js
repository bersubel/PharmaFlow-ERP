const express = require("express");

const router = express.Router();


const protect = require("../../middleware/auth.middleware");

const permission = require("../../middleware/permission.middleware");



const {

    getBrands,

    getBrand,

    createBrand,

    updateBrand,

    updateStatus,

    deleteBrand

}=require("./brand.controller");



const {

    createBrandValidation

}=require("./brand.validation");



const {

    validationResult

}=require("express-validator");




const validate=(req,res,next)=>{


    const errors =
        validationResult(req);



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
    getBrands
);



router.get(
    "/:id",
    protect,
    getBrand
);



router.post(

    "/",

    protect,

    permission("products.manage"),

    createBrandValidation,

    validate,

    createBrand

);





router.put(

    "/:id",

    protect,

    permission("products.manage"),

    updateBrand

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

    deleteBrand

);




module.exports = router;