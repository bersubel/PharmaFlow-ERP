const saleService =
    require("./sale.service");


const createSale = async (
    req,
    res
) => {

    try {

        const sale =
            await saleService.createSale(

                req.body,

                req.user._id

            );


        res.status(201).json({

            success: true,

            message:
                "Sale created successfully",

            data: sale

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


const getSales = async (
    req,
    res
) => {

    try {

        const sales =
            await saleService.getSales();


        res.json({

            success: true,

            data: sales

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const getSale = async (
    req,
    res
) => {

    try {

        const sale =
            await saleService.getSale(
                req.params.id
            );


        res.json({

            success: true,

            data: sale

        });

    } catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};


const updateSale = async (
    req,
    res
) => {

    try {

        const sale =
            await saleService.updateSale(

                req.params.id,

                req.body

            );


        res.json({

            success: true,

            message:
                "Sale updated successfully",

            data: sale

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


const completeSale = async (
    req,
    res
) => {

    try {

        const sale =
            await saleService.completeSale(

                req.params.id,

                req.user._id

            );


        res.json({

            success: true,

            message:
                "Sale completed successfully",

            data: sale

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


const cancelSale = async (
    req,
    res
) => {

    try {

        const sale =
            await saleService.cancelSale(
                req.params.id
            );


        res.json({

            success: true,

            message:
                "Sale cancelled successfully",

            data: sale

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


module.exports = {

    createSale,

    getSales,

    getSale,

    updateSale,

    completeSale,

    cancelSale

};