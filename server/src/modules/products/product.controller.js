const productService = require("./product.service");



const getProducts = async(req,res)=>{

try{

const products =
await productService.getProducts();


res.json({

success:true,

data:products

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};





const getProduct = async(req,res)=>{

try{


const product =
await productService.getProduct(
req.params.id
);



if(!product){

return res.status(404).json({

success:false,

message:"Product not found"

});

}



res.json({

success:true,

data:product

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};







const createProduct = async(req,res)=>{

try{


const product =
await productService.createProduct(

req.body,

req.user._id

);



res.status(201).json({

success:true,

message:"Product created successfully",

data:product

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};







const updateProduct = async(req,res)=>{

try{


const product =
await productService.updateProduct(

req.params.id,

req.body

);



res.json({

success:true,

message:"Product updated successfully",

data:product

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};







const updateStatus = async(req,res)=>{

try{


const product =
await productService.updateStatus(

req.params.id,

req.body.status

);



res.json({

success:true,

message:"Product status updated successfully",

data:product

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};






const deleteProduct = async(req,res)=>{

try{


await productService.deleteProduct(
req.params.id
);



res.json({

success:true,

message:"Product deleted successfully"

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};





module.exports={

getProducts,

getProduct,

createProduct,

updateProduct,

updateStatus,

deleteProduct

};