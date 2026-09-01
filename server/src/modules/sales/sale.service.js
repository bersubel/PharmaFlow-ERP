const Sale = require("./sale.model");

const Product = require("../products/product.model");

const Customer = require("../customers/customer.model");

const Inventory = require("../inventory/inventory.model");

const notificationService = require("../notifications/notification.service");

const generateSaleNumber = async () => {

    const count = await Sale.countDocuments();

    const number = count + 1;

    return `SALE-${String(number).padStart(4, "0")}`;

};


const calculateTotals = (
    items,
    tax = 0,
    discount = 0
) => {

    const processedItems = items.map(item => {

        const quantity =
            Number(item.quantity);


        const sellingPrice =
            Number(item.sellingPrice);


        const subtotal =
            quantity * sellingPrice;


        return {

            product: item.product,

            quantity,

            sellingPrice,

            subtotal

        };

    });


    const subtotal =
        processedItems.reduce(

            (total, item) =>
                total + item.subtotal,

            0

        );


    const total =
        subtotal +
        Number(tax) -
        Number(discount);


    if (total < 0) {

        throw new Error(
            "Sale total cannot be negative"
        );

    }


    return {

        processedItems,

        subtotal,

        total

    };

};


const createSale = async (
    data,
    userId
) => {

    if (data.customer) {

        const customer =
            await Customer.findById(
                data.customer
            );


        if (!customer) {

            throw new Error(
                "Customer not found"
            );

        }

    }


    const items = [];


    for (const item of data.items) {

        const product =
            await Product.findById(
                item.product
            );


        if (!product) {

            throw new Error(
                `Product not found: ${item.product}`
            );

        }


        if (!product.isActive) {

            throw new Error(
                `Product is inactive: ${product.name}`
            );

        }


        const sellingPrice =
            item.sellingPrice !== undefined

                ? Number(item.sellingPrice)

                : product.sellingPrice;


        items.push({

            product: product._id,

            quantity: Number(item.quantity),

            sellingPrice

        });

    }


    const {

        processedItems,

        subtotal,

        total

    } = calculateTotals(

        items,

        data.tax || 0,

        data.discount || 0

    );


    const saleNumber =
        await generateSaleNumber();


    const sale = await Sale.create({

    saleNumber,

    customer:
        data.customer || null,

    items: processedItems,

    subtotal,

    tax: Number(data.tax || 0),

    discount:
        Number(data.discount || 0),

    total,

    paymentMethod:
        data.paymentMethod || "CASH",

    paymentStatus:
        data.paymentStatus || "PAID",

    notes:
        data.notes || "",

    createdBy: userId

});


    return sale;

};


const getSales = async () => {

    return await Sale.find()

        .populate(
            "customer",
            "firstName lastName phone email"
        )

        .populate(
            "createdBy",
            "firstName lastName"
        )

        .populate(
            "items.product",
            "name barcode"
        )

        .sort({
            createdAt: -1
        });

};


const getSale = async (id) => {

    const sale =
        await Sale.findById(id)

            .populate(
                "customer",
                "firstName lastName phone email"
            )

            .populate(
                "createdBy",
                "firstName lastName"
            )

            .populate(
                "items.product",
                "name barcode"
            );


    if (!sale) {

        throw new Error(
            "Sale not found"
        );

    }


    return sale;

};


const updateSale = async (
    id,
    data
) => {

    const sale =
        await Sale.findById(id);


    if (!sale) {

        throw new Error(
            "Sale not found"
        );

    }


    if (sale.status !== "DRAFT") {

        throw new Error(
            "Only draft sales can be updated"
        );

    }


    if (data.customer) {

        const customer =
            await Customer.findById(
                data.customer
            );


        if (!customer) {

            throw new Error(
                "Customer not found"
            );

        }

    }


    let items;


    if (data.items) {

        items = [];


        for (const item of data.items) {

            const product =
                await Product.findById(
                    item.product
                );


            if (!product) {

                throw new Error(
                    `Product not found: ${item.product}`
                );

            }


            const sellingPrice =
                item.sellingPrice !== undefined

                    ? Number(item.sellingPrice)

                    : product.sellingPrice;


            items.push({

                product: product._id,

                quantity:
                    Number(item.quantity),

                sellingPrice

            });

        }

    } else {

        items = sale.items.map(item => ({

            product: item.product,

            quantity: item.quantity,

            sellingPrice: item.sellingPrice

        }));

    }


    const tax =
        data.tax !== undefined

            ? Number(data.tax)

            : sale.tax;


    const discount =
        data.discount !== undefined

            ? Number(data.discount)

            : sale.discount;


    const {

        processedItems,

        subtotal,

        total

    } = calculateTotals(

        items,

        tax,

        discount

    );


    sale.items =
        processedItems;

    sale.subtotal =
        subtotal;

    sale.tax =
        tax;

    sale.discount =
        discount;

    sale.total =
        total;


    if (data.customer !== undefined) {

        sale.customer =
            data.customer || null;

    }


    if (data.paymentMethod) {

        sale.paymentMethod =
            data.paymentMethod;

    }


    if (data.paymentStatus) {

        sale.paymentStatus =
            data.paymentStatus;

    }


    if (data.notes !== undefined) {

        sale.notes =
            data.notes;

    }


    await sale.save();


    return sale;

};


const completeSale = async (
    id,
    userId
) => {

    const sale =
        await Sale.findById(id);


    if (!sale) {

        throw new Error(
            "Sale not found"
        );

    }


    if (sale.status !== "DRAFT") {

        throw new Error(
            "Only draft sales can be completed"
        );

    }


    // ==========================================
    // CHECK ALL STOCK BEFORE CHANGING ANYTHING
    // ==========================================

    for (const item of sale.items) {

        const product =
            await Product.findById(
                item.product
            );


        if (!product) {

            throw new Error(
                `Product not found: ${item.product}`
            );

        }


        if (
            product.quantity <
            item.quantity
        ) {

            throw new Error(
                `Insufficient stock for ${product.name}. Available: ${product.quantity}, requested: ${item.quantity}`
            );

        }

    }


    // ==========================================
    // REDUCE STOCK + CREATE INVENTORY MOVEMENTS
    // ==========================================

    for (const item of sale.items) {

        const product =
            await Product.findById(
                item.product
            );


        product.quantity -=
            item.quantity;


        await product.save();


        await Inventory.create({

            product: product._id,

            type: "OUT",

            quantity: item.quantity,

            reference:
                sale.saleNumber,

            remarks:
                "Customer sale",

            createdBy: userId

        });


        // Check low stock after sale
        await notificationService
            .checkProductNotifications(

                product,

                userId

            );

    }


    // ==========================================
    // COMPLETE SALE
    // ==========================================

    sale.status =
        "COMPLETED";


    sale.completedAt =
        new Date();


    await sale.save();


    // ==========================================
    // SALE NOTIFICATION
    // ==========================================

    await notificationService
        .notifySaleCompleted(

            sale,

            userId

        );


    return sale;

};


const cancelSale = async (id) => {

    const sale =
        await Sale.findById(id);


    if (!sale) {

        throw new Error(
            "Sale not found"
        );

    }


    if (sale.status !== "DRAFT") {

        throw new Error(
            "Only draft sales can be cancelled"
        );

    }


    sale.status =
        "CANCELLED";


    await sale.save();


    return sale;

};


module.exports = {

    createSale,

    getSales,

    getSale,

    updateSale,

    completeSale,

    cancelSale

};