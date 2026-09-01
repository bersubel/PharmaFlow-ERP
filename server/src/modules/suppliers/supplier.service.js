const Supplier = require("./supplier.model");

const getSuppliers = async () => {

    return await Supplier.find()
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });

};

const getSupplier = async (id) => {

    return await Supplier.findById(id)
        .populate("createdBy", "firstName lastName email");

};

const createSupplier = async (data, userId) => {

    return await Supplier.create({
        ...data,
        createdBy: userId
    });

};

const updateSupplier = async (id, data) => {

    return await Supplier.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

};

const updateStatus = async (id, status) => {

    return await Supplier.findByIdAndUpdate(
        id,
        {
            isActive: status
        },
        {
            new: true
        }
    );

};

const deleteSupplier = async (id) => {

    return await Supplier.findByIdAndDelete(id);

};

module.exports = {
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    updateStatus,
    deleteSupplier
};