const Category = require("./category.model");

const getCategories = async () => {

    return await Category.find()
        .populate(
            "createdBy",
            "firstName lastName email"
        )
        .sort({
            createdAt: -1
        });

};

const getCategory = async (id) => {

    return await Category.findById(id)
        .populate(
            "createdBy",
            "firstName lastName email"
        );

};

const createCategory = async (data, userId) => {

    return await Category.create({
        ...data,
        createdBy: userId
    });

};

const updateCategory = async (id, data) => {

    return await Category.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

};

const updateStatus = async (id, status) => {

    return await Category.findByIdAndUpdate(
        id,
        {
            isActive: status
        },
        {
            new: true
        }
    );

};

const deleteCategory = async (id) => {

    return await Category.findByIdAndDelete(id);

};

module.exports = {

    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    updateStatus,
    deleteCategory

};