const reportService =
    require("./report.service");


const getSalesReport = async (
    req,
    res
) => {

    try {

        const report =
            await reportService.getSalesReport(

                req.query.startDate,

                req.query.endDate

            );


        res.json({

            success: true,

            data: report

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const getPurchaseReport = async (
    req,
    res
) => {

    try {

        const report =
            await reportService.getPurchaseReport(

                req.query.startDate,

                req.query.endDate

            );


        res.json({

            success: true,

            data: report

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const getInventoryReport = async (
    req,
    res
) => {

    try {

        const report =
            await reportService
                .getInventoryReport();


        res.json({

            success: true,

            data: report

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const getInventoryMovementReport = async (
    req,
    res
) => {

    try {

        const report =
            await reportService
                .getInventoryMovementReport(

                    req.query.startDate,

                    req.query.endDate

                );


        res.json({

            success: true,

            data: report

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


module.exports = {

    getSalesReport,

    getPurchaseReport,

    getInventoryReport,

    getInventoryMovementReport

};