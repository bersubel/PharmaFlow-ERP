const supplierService = require("./supplier.service");

const getSuppliers = async (req, res) => {

    try {

        const suppliers =
            await supplierService.getSuppliers();

        res.json({
            success: true,
            data: suppliers
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const getSupplier = async (req, res) => {

    try {

        const supplier =
            await supplierService.getSupplier(req.params.id);

        if (!supplier) {

            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });

        }

        res.json({
            success: true,
            data: supplier
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const createSupplier = async (req, res) => {

    try {

        const supplier =
            await supplierService.createSupplier(
                req.body,
                req.user._id
            );

        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: supplier
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateSupplier = async (req, res) => {

    try {

        const supplier =
            await supplierService.updateSupplier(
                req.params.id,
                req.body
            );

        res.json({
            success: true,
            message: "Supplier updated successfully",
            data: supplier
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

        const supplier =
            await supplierService.updateStatus(
                req.params.id,
                req.body.status
            );

        res.json({
            success: true,
            message: "Supplier status updated successfully",
            data: supplier
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const deleteSupplier = async (req, res) => {

    try {

        await supplierService.deleteSupplier(req.params.id);

        res.json({
            success: true,
            message: "Supplier deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {

    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    updateStatus,
    deleteSupplier

};