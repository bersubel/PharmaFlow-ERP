const Manufacturer = require("./manufacturer.model");



const getManufacturers = async () => {


    return await Manufacturer.find()

        .populate(
            "createdBy",
            "firstName lastName email"
        )

        .sort({
            createdAt: -1
        });


};



const getManufacturer = async (id) => {


    return await Manufacturer.findById(id)

        .populate(
            "createdBy",
            "firstName lastName email"
        );


};



const createManufacturer = async (data, userId) => {


    return await Manufacturer.create({

        ...data,

        createdBy: userId

    });


};



const updateManufacturer = async (id, data) => {


    return await Manufacturer.findByIdAndUpdate(

        id,

        data,

        {

            new: true,

            runValidators: true

        }

    );


};



const updateStatus = async (id, status) => {


    return await Manufacturer.findByIdAndUpdate(

        id,

        {

            isActive: status

        },

        {

            new: true

        }

    );


};



const deleteManufacturer = async (id) => {


    return await Manufacturer.findByIdAndDelete(id);


};



module.exports = {


    getManufacturers,

    getManufacturer,

    createManufacturer,

    updateManufacturer,

    updateStatus,

    deleteManufacturer


};