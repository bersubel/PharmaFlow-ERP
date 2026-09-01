const Unit = require("./unit.model");



const getUnits = async()=>{


    return await Unit.find()

        .populate(
            "createdBy",
            "firstName lastName email"
        )

        .sort({
            createdAt:-1
        });


};




const getUnit = async(id)=>{


    return await Unit.findById(id)

        .populate(
            "createdBy",
            "firstName lastName email"
        );


};




const createUnit = async(data,userId)=>{


    return await Unit.create({

        ...data,

        createdBy:userId

    });


};





const updateUnit = async(id,data)=>{


    return await Unit.findByIdAndUpdate(

        id,

        data,

        {

            new:true,

            runValidators:true

        }

    );


};





const updateStatus = async(id,status)=>{


    return await Unit.findByIdAndUpdate(

        id,

        {

            isActive:status

        },

        {

            new:true

        }

    );


};





const deleteUnit = async(id)=>{


    return await Unit.findByIdAndDelete(id);


};





module.exports={

    getUnits,

    getUnit,

    createUnit,

    updateUnit,

    updateStatus,

    deleteUnit

};