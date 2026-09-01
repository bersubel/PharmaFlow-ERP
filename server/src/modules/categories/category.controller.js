const categoryService = require("./category.service");

const getCategories = async (req, res) => {

    try {

        const categories =
            await categoryService.getCategories();

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const getCategory = async (req, res) => {

    try {

        const category =
            await categoryService.getCategory(req.params.id);

        if (!category) {

            return res.status(404).json({
                success: false,
                message: "Category not found"
            });

        }

        res.json({
            success: true,
            data: category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const createCategory = async (req, res) => {

    try {

        const category =
            await categoryService.createCategory(
                req.body,
                req.user._id
            );

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateCategory = async (req, res) => {

    try {

        const category =
            await categoryService.updateCategory(
                req.params.id,
                req.body
            );

        res.json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateStatus = async (req, res) => {

    try {

        const category =
            await categoryService.updateStatus(
                req.params.id,
                req.body.status
            );

        res.json({
            success: true,
            message: "Status updated successfully",
            data: category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const deleteCategory = async (req, res) => {

    try {

        await categoryService.deleteCategory(req.params.id);

        res.json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    updateStatus,
    deleteCategory
};