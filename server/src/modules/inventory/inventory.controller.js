const inventoryService = require("./inventory.service");

const getInventory = async (req, res) => {

    try {

        const data = await inventoryService.getInventory();

        res.json({

            success: true,

            data

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const createMovement = async (req, res) => {

    try {

        const movement = await inventoryService.createMovement(

            req.body,

            req.user._id

        );

        res.status(201).json({

            success: true,

            message: "Inventory updated successfully",

            data: movement

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};
const getLowStock = async (req, res) => {

    try {

        const data =
            await inventoryService.getLowStock();


        res.json({

            success: true,

            data

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



const getExpiringProducts = async (req, res) => {

    try {

        const days =
            req.query.days || 90;


        const data =
            await inventoryService.getExpiringProducts(
                days
            );


        res.json({

            success: true,

            days: Number(days),

            data

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



const getInventorySummary = async (req, res) => {

    try {

        const data =
            await inventoryService.getInventorySummary();


        res.json({

            success: true,

            data

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
module.exports = {

    getInventory,

    createMovement,

    getLowStock,

    getExpiringProducts,

    getInventorySummary

};