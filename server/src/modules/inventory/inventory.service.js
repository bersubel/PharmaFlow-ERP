const Inventory = require("./inventory.model");
const Product = require("../products/product.model");

const getInventory = async () => {

    return await Inventory.find()

        .populate(

            "product",

            "name barcode"

        )

        .populate(

            "createdBy",

            "firstName lastName"

        )

        .sort({

            createdAt: -1

        });

};

const createMovement = async (data, userId) => {

    const product = await Product.findById(
        data.product
    );

    if (!product) {

        throw new Error(
            "Product not found"
        );

    }

    if (data.type === "IN") {

        product.quantity += data.quantity;

    } else {

        if (product.quantity < data.quantity) {

            throw new Error(
                "Insufficient stock"
            );

        }

        product.quantity -= data.quantity;

    }

    await product.save();

    return await Inventory.create({

        ...data,

        createdBy: userId

    });

};
const getLowStock = async () => {

    return await Product.find({

        isActive: true,

        $expr: {
            $lte: [
                "$quantity",
                "$reorderLevel"
            ]
        }

    })

    .populate("category", "name")

    .populate("unit", "name shortName")

    .sort({
        quantity: 1
    });

};



const getExpiringProducts = async (days = 90) => {

    const today = new Date();

    const futureDate = new Date();

    futureDate.setDate(
        today.getDate() + Number(days)
    );


    return await Product.find({

        isActive: true,

        expiryDate: {

            $gte: today,

            $lte: futureDate

        }

    })

    .populate("category", "name")

    .populate("unit", "name shortName")

    .sort({

        expiryDate: 1

    });

};



const getInventorySummary = async () => {

    const products = await Product.find({

        isActive: true

    });


    const totalProducts = products.length;


    const totalUnits = products.reduce(

        (total, product) =>
            total + product.quantity,

        0

    );


    const lowStockProducts = products.filter(

        product =>
            product.quantity <=
            product.reorderLevel

    ).length;


    const expiredProducts = products.filter(

        product =>
            product.expiryDate &&
            product.expiryDate < new Date()

    ).length;


    return {

        totalProducts,

        totalUnits,

        lowStockProducts,

        expiredProducts

    };

};
module.exports = {

    getInventory,

    createMovement,

    getLowStock,

    getExpiringProducts,

    getInventorySummary

};