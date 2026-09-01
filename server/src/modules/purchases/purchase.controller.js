const purchaseService = require("./purchase.service");


const createPurchase = async (req, res) => {

    try {

        const purchase =
            await purchaseService.createPurchase(

                req.body,

                req.user._id

            );


        res.status(201).json({

            success: true,

            message:
                "Purchase created successfully",

            data: purchase

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


const getPurchases = async (req, res) => {

    try {

        const purchases =
            await purchaseService.getPurchases();


        res.json({

            success: true,

            data: purchases

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const getPurchase = async (req, res) => {

    try {

        const purchase =
            await purchaseService.getPurchase(
                req.params.id
            );


        res.json({

            success: true,

            data: purchase

        });

    } catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};


const updatePurchase = async (req, res) => {

    try {

        const purchase =
            await purchaseService.updatePurchase(

                req.params.id,

                req.body

            );


        res.json({

            success: true,

            message:
                "Purchase updated successfully",

            data: purchase

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


const receivePurchase = async (req, res) => {

    try {

        const purchase =
            await purchaseService.receivePurchase(

                req.params.id,

                req.user._id

            );


        res.json({

            success: true,

            message:
                "Purchase received successfully",

            data: purchase

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


const cancelPurchase = async (req, res) => {

    try {

        const purchase =
            await purchaseService.cancelPurchase(

                req.params.id

            );


        res.json({

            success: true,

            message:
                "Purchase cancelled successfully",

            data: purchase

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


module.exports = {

    createPurchase,

    getPurchases,

    getPurchase,

    updatePurchase,

    receivePurchase,

    cancelPurchase

};