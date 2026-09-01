const customerService =
    require("./customer.service");


const createCustomer = async (
    req,
    res
) => {

    try {

        const customer =
            await customerService.createCustomer(

                req.body,

                req.user._id

            );

        res.status(201).json({

            success: true,

            message:
                "Customer created successfully",

            data: customer

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


const getCustomers = async (
    req,
    res
) => {

    try {

        const customers =
            await customerService.getCustomers();

        res.json({

            success: true,

            data: customers

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const getCustomer = async (
    req,
    res
) => {

    try {

        const customer =
            await customerService.getCustomer(
                req.params.id
            );

        res.json({

            success: true,

            data: customer

        });

    } catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};


const updateCustomer = async (
    req,
    res
) => {

    try {

        const customer =
            await customerService.updateCustomer(

                req.params.id,

                req.body

            );

        res.json({

            success: true,

            message:
                "Customer updated successfully",

            data: customer

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


const updateStatus = async (
    req,
    res
) => {

    try {

        const customer =
            await customerService.updateStatus(

                req.params.id,

                req.body.isActive

            );

        res.json({

            success: true,

            message:
                "Customer status updated successfully",

            data: customer

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


const deleteCustomer = async (
    req,
    res
) => {

    try {

        await customerService.deleteCustomer(
            req.params.id
        );

        res.json({

            success: true,

            message:
                "Customer deleted successfully"

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


module.exports = {

    createCustomer,

    getCustomers,

    getCustomer,

    updateCustomer,

    updateStatus,

    deleteCustomer

};