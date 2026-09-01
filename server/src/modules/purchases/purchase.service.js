const Purchase = require("./purchase.model");

const Supplier = require("../suppliers/supplier.model");

const Product = require("../products/product.model");

const Inventory = require("../inventory/inventory.model");

const notificationService = require("../notifications/notification.service");

const generatePurchaseNumber = async () => {

    const count = await Purchase.countDocuments();

    const number = count + 1;

    return `PUR-${String(number).padStart(4, "0")}`;

};


const calculateTotals = (items, tax = 0, discount = 0) => {

    const processedItems = items.map(item => {

        const quantity = Number(item.quantity);

        const purchasePrice = Number(
            item.purchasePrice
        );

        const subtotal =
            quantity * purchasePrice;

        return {
            product: item.product,
            quantity,
            purchasePrice,
            subtotal
        };

    });


    const subtotal = processedItems.reduce(

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
            "Purchase total cannot be negative"
        );

    }


    return {
        processedItems,
        subtotal,
        total
    };

};


const createPurchase = async (data, userId) => {

    const supplier = await Supplier.findById(
        data.supplier
    );


    if (!supplier) {

        throw new Error(
            "Supplier not found"
        );

    }


    if (!supplier.isActive) {

        throw new Error(
            "Supplier is inactive"
        );

    }


    for (const item of data.items) {

        const product = await Product.findById(
            item.product
        );


        if (!product) {

            throw new Error(
                `Product not found: ${item.product}`
            );

        }

    }


    const {
        processedItems,
        subtotal,
        total
    } = calculateTotals(

        data.items,

        data.tax || 0,

        data.discount || 0

    );


    const purchaseNumber =
        await generatePurchaseNumber();


    const purchase =
        await Purchase.create({

            purchaseNumber,

            supplier: data.supplier,

            items: processedItems,

            subtotal,

            tax: Number(data.tax || 0),

            discount: Number(data.discount || 0),

            total,

            notes: data.notes || "",

            createdBy: userId

        });


    return purchase;

};


const getPurchases = async () => {

    return await Purchase.find()

        .populate(
            "supplier",
            "companyName contactPerson phone"
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


const getPurchase = async (id) => {

    const purchase =
        await Purchase.findById(id)

            .populate(
                "supplier",
                "companyName contactPerson phone"
            )

            .populate(
                "createdBy",
                "firstName lastName"
            )

            .populate(
                "items.product",
                "name barcode"
            );


    if (!purchase) {

        throw new Error(
            "Purchase not found"
        );

    }


    return purchase;

};


const updatePurchase = async (id, data) => {

    const purchase =
        await Purchase.findById(id);


    if (!purchase) {

        throw new Error(
            "Purchase not found"
        );

    }


    if (purchase.status !== "DRAFT") {

        throw new Error(
            "Only draft purchases can be updated"
        );

    }


    if (data.supplier) {

        const supplier =
            await Supplier.findById(
                data.supplier
            );


        if (!supplier) {

            throw new Error(
                "Supplier not found"
            );

        }

    }


    const supplier =
        data.supplier ||
        purchase.supplier;


    const items =
        data.items ||
        purchase.items;


    const tax =
        data.tax !== undefined
            ? Number(data.tax)
            : purchase.tax;


    const discount =
        data.discount !== undefined
            ? Number(data.discount)
            : purchase.discount;


    const {
        processedItems,
        subtotal,
        total
    } = calculateTotals(

        items,

        tax,

        discount

    );


    purchase.supplier = supplier;

    purchase.items = processedItems;

    purchase.subtotal = subtotal;

    purchase.tax = tax;

    purchase.discount = discount;

    purchase.total = total;


    if (data.notes !== undefined) {

        purchase.notes = data.notes;

    }


    await purchase.save();


    return purchase;

};


const receivePurchase = async (
    id,
    userId
) => {

    const purchase =
        await Purchase.findById(id);


    if (!purchase) {

        throw new Error(
            "Purchase not found"
        );

    }


    if (purchase.status !== "DRAFT") {

        throw new Error(
            "Only draft purchases can be received"
        );

    }


    // ==========================================
    // RECEIVE PRODUCTS
    // ==========================================

    for (const item of purchase.items) {

        const product =
            await Product.findById(
                item.product
            );


        if (!product) {

            throw new Error(
                `Product not found: ${item.product}`
            );

        }


        product.quantity +=
            item.quantity;


        await product.save();


        await Inventory.create({

            product: product._id,

            type: "IN",

            quantity: item.quantity,

            reference:
                purchase.purchaseNumber,

            remarks:
                "Purchase received from supplier",

            createdBy: userId

        });
    

        // Check product notifications
        await notificationService
            .checkProductNotifications(

                product,

                userId

            );

    }


    // ==========================================
    // COMPLETE PURCHASE
    // ==========================================

    purchase.status =
        "RECEIVED";


    purchase.receivedAt =
        new Date();


    await purchase.save();


    // ==========================================
    // PURCHASE NOTIFICATION
    // ==========================================

    await notificationService
        .notifyPurchaseReceived(

            purchase,

            userId

        );


    return purchase;

};


const cancelPurchase = async (id) => {

    const purchase =
        await Purchase.findById(id);


    if (!purchase) {

        throw new Error(
            "Purchase not found"
        );

    }


    if (purchase.status !== "DRAFT") {

        throw new Error(
            "Only draft purchases can be cancelled"
        );

    }


    purchase.status = "CANCELLED";


    await purchase.save();


    return purchase;

};


module.exports = {

    createPurchase,

    getPurchases,

    getPurchase,

    updatePurchase,

    receivePurchase,

    cancelPurchase

};