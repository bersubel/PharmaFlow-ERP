const express = require("express");

const router = express.Router();


const protect = require("../../middleware/auth.middleware");

const permission = require("../../middleware/permission.middleware");


const {

getProducts,
getProduct,
createProduct,
updateProduct,
updateStatus,
deleteProduct

}=require("./product.controller");



const {
createProductValidation
}=require("./product.validation");


const {
validationResult
}=require("express-validator");



const validate=(req,res,next)=>{

const errors=validationResult(req);


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
getProducts
);



router.get(
"/:id",
protect,
getProduct
);



router.post(
"/",
protect,
permission("products.manage"),
createProductValidation,
validate,
createProduct
);



router.put(
"/:id",
protect,
permission("products.manage"),
updateProduct
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
deleteProduct
);



module.exports = router;