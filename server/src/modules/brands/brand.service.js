const Brand = require("./brand.model");



const getBrands = async () => {


    return await Brand.find()

        .populate(
            "createdBy",
            "firstName lastName email"
        )

        .sort({
            createdAt:-1
        });


};





const getBrand = async(id)=>{


    return await Brand.findById(id)

        .populate(
            "createdBy",
            "firstName lastName email"
        );


};





const createBrand = async(data,userId)=>{


    return await Brand.create({

        ...data,

        createdBy:userId

    });


};





const updateBrand = async(id,data)=>{


    return await Brand.findByIdAndUpdate(

        id,

        data,

        {

            new:true,

            runValidators:true

        }

    );


};





const updateStatus = async(id,status)=>{


    return await Brand.findByIdAndUpdate(

        id,

        {

            isActive:status

        },

        {

            new:true

        }

    );


};





const deleteBrand = async(id)=>{


    return await Brand.findByIdAndDelete(id);


};





module.exports={

    getBrands,

    getBrand,

    createBrand,

    updateBrand,

    updateStatus,

    deleteBrand

};