const Product = require("./product.model");



const populateFields = [

    {
        path:"category",
        select:"name"
    },

    {
        path:"brand",
        select:"name"
    },

    {
        path:"manufacturer",
        select:"name"
    },

    {
        path:"supplier",
        select:"companyName"
    },

    {
        path:"unit",
        select:"name shortName"
    },

    {
        path:"createdBy",
        select:"firstName lastName"
    }

];





const getProducts = async()=>{


    return await Product.find()

        .populate(populateFields)

        .sort({
            createdAt:-1
        });


};





const getProduct = async(id)=>{


    return await Product.findById(id)

        .populate(populateFields);


};






const createProduct = async(data,userId)=>{


    return await Product.create({

        ...data,

        createdBy:userId

    });


};






const updateProduct = async(id,data)=>{


    return await Product.findByIdAndUpdate(

        id,

        data,

        {

            new:true,

            runValidators:true

        }

    );


};






const updateStatus = async(id,status)=>{


    return await Product.findByIdAndUpdate(

        id,

        {
            isActive:status
        },

        {
            new:true
        }

    );


};






const deleteProduct = async(id)=>{


    return await Product.findByIdAndDelete(id);


};





module.exports={


    getProducts,

    getProduct,

    createProduct,

    updateProduct,

    updateStatus,

    deleteProduct


};