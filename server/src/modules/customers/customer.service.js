const Customer = require("./customer.model");

const createCustomer = async (
    data,
    userId
) => {

    const existingCustomer =
        await Customer.findOne({
            phone: data.phone
        });

    if (existingCustomer) {

        throw new Error(
            "Customer with this phone number already exists"
        );

    }

    const customer =
        await Customer.create({

            firstName: data.firstName,

            lastName: data.lastName,

            phone: data.phone,

            email: data.email || "",

            address: data.address || "",

            createdBy: userId

        });

    return customer;
};


const getCustomers = async () => {

    return await Customer.find()

        .populate(
            "createdBy",
            "firstName lastName"
        )

        .sort({
            createdAt: -1
        });
};


const getCustomer = async (id) => {

    const customer =
        await Customer.findById(id)

            .populate(
                "createdBy",
                "firstName lastName"
            );

    if (!customer) {

        throw new Error(
            "Customer not found"
        );

    }

    return customer;
};


const updateCustomer = async (
    id,
    data
) => {

    const customer =
        await Customer.findById(id);

    if (!customer) {

        throw new Error(
            "Customer not found"
        );

    }

    if (data.phone) {

        const existingCustomer =
            await Customer.findOne({

                phone: data.phone,

                _id: {
                    $ne: id
                }

            });

        if (existingCustomer) {

            throw new Error(
                "Customer with this phone number already exists"
            );

        }

    }

    Object.assign(
        customer,
        data
    );

    await customer.save();

    return customer;
};


const updateStatus = async (
    id,
    isActive
) => {

    const customer =
        await Customer.findById(id);

    if (!customer) {

        throw new Error(
            "Customer not found"
        );

    }

    customer.isActive =
        isActive;

    await customer.save();

    return customer;
};


const deleteCustomer = async (
    id
) => {

    const customer =
        await Customer.findById(id);

    if (!customer) {

        throw new Error(
            "Customer not found"
        );

    }

    await customer.deleteOne();

    return customer;
};


module.exports = {

    createCustomer,

    getCustomers,

    getCustomer,

    updateCustomer,

    updateStatus,

    deleteCustomer

};