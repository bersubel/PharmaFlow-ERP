const Notification = require("./notification.model");

const Product = require("../products/product.model");

const User = require("../users/user.model");


// ======================================================
// BASIC NOTIFICATION CREATION
// ======================================================

const createNotification = async ({
    user,
    type,
    title,
    message,
    referenceId = null
}) => {

    const notification =
        await Notification.create({

            user,

            type,

            title,

            message,

            referenceId

        });


    return notification;
};


// ======================================================
// CREATE NOTIFICATION ONLY IF AN UNREAD ONE DOESN'T EXIST
// ======================================================

const createUniqueNotification = async ({
    user,
    type,
    title,
    message,
    referenceId = null
}) => {

    const existing =
        await Notification.findOne({

            user,

            type,

            title,

            message,

            referenceId,

            isRead: false

        });


    if (existing) {

        return existing;

    }


    return await createNotification({

        user,

        type,

        title,

        message,

        referenceId

    });

};


// ======================================================
// SALE NOTIFICATION
// ======================================================

const notifySaleCompleted = async (
    sale,
    userId
) => {

    return await createNotification({

        user: userId,

        type: "SALE",

        title: "Sale Completed",

        message:
            `Sale ${sale.saleNumber} was completed successfully. Total: ${sale.total}`,

        referenceId: sale._id

    });

};


// ======================================================
// PURCHASE NOTIFICATION
// ======================================================

const notifyPurchaseReceived = async (
    purchase,
    userId
) => {

    return await createNotification({

        user: userId,

        type: "PURCHASE",

        title: "Purchase Received",

        message:
            `Purchase ${purchase.purchaseNumber} was received successfully. Total: ${purchase.total}`,

        referenceId: purchase._id

    });

};


// ======================================================
// LOW STOCK NOTIFICATION
// ======================================================

const notifyLowStock = async (
    product,
    userId
) => {

    if (!product) {

        return null;

    }


    if (
        !product.isActive ||
        product.quantity > product.reorderLevel
    ) {

        return null;

    }


    return await createUniqueNotification({

        user: userId,

        type: "LOW_STOCK",

        title: "Low Stock Alert",

        message:
            `${product.name} is low on stock. Current quantity: ${product.quantity}. Reorder level: ${product.reorderLevel}.`,

        referenceId: product._id

    });

};


// ======================================================
// EXPIRY NOTIFICATION
// ======================================================

const notifyExpiringProduct = async (
    product,
    userId,
    days = 90
) => {

    if (
        !product ||
        !product.isActive ||
        !product.expiryDate
    ) {

        return null;

    }


    const today = new Date();

    const expiryDate =
        new Date(product.expiryDate);


    const futureDate =
        new Date(today);


    futureDate.setDate(
        today.getDate() + Number(days)
    );


    if (
        expiryDate < today ||
        expiryDate > futureDate
    ) {

        return null;

    }


    const formattedDate =
        expiryDate.toISOString()
            .split("T")[0];


    return await createUniqueNotification({

        user: userId,

        type: "EXPIRY",

        title: "Medicine Expiry Alert",

        message:
            `${product.name} will expire on ${formattedDate}.`,

        referenceId: product._id

    });

};


// ======================================================
// CHECK ALL PRODUCT-LEVEL NOTIFICATIONS
// ======================================================

const checkProductNotifications = async (
    product,
    userId
) => {

    await notifyLowStock(
        product,
        userId
    );


    await notifyExpiringProduct(
        product,
        userId
    );

};


// ======================================================
// GET ALL NOTIFICATIONS
// ======================================================

const getNotifications = async (
    userId
) => {

    return await Notification.find({

        user: userId

    })

        .sort({

            createdAt: -1

        });

};


// ======================================================
// GET UNREAD NOTIFICATIONS
// ======================================================

const getUnreadNotifications = async (
    userId
) => {

    return await Notification.find({

        user: userId,

        isRead: false

    })

        .sort({

            createdAt: -1

        });

};


// ======================================================
// GET UNREAD COUNT
// ======================================================

const getUnreadCount = async (
    userId
) => {

    return await Notification.countDocuments({

        user: userId,

        isRead: false

    });

};


// ======================================================
// MARK ONE AS READ
// ======================================================

const markAsRead = async (
    notificationId,
    userId
) => {

    const notification =
        await Notification.findOne({

            _id: notificationId,

            user: userId

        });


    if (!notification) {

        throw new Error(
            "Notification not found"
        );

    }


    notification.isRead = true;


    await notification.save();


    return notification;

};


// ======================================================
// MARK ALL AS READ
// ======================================================

const markAllAsRead = async (
    userId
) => {

    await Notification.updateMany(

        {

            user: userId,

            isRead: false

        },

        {

            $set: {

                isRead: true

            }

        }

    );


    return true;

};


// ======================================================
// DELETE
// ======================================================

const deleteNotification = async (
    notificationId,
    userId
) => {

    const notification =
        await Notification.findOneAndDelete({

            _id: notificationId,

            user: userId

        });


    if (!notification) {

        throw new Error(
            "Notification not found"
        );

    }


    return notification;

};


// ======================================================
// AUTOMATIC EXPIRY CHECK
// ======================================================

const runExpiryNotificationCheck = async () => {

    try {

        const users =
            await User.find({

                isActive: true

            })
                .populate(
                    "role",
                    "name"
                );


        const notificationUsers =
            users.filter(
                user =>
                    user.role &&
                    user.role.name === "Admin"
            );


        if (
            notificationUsers.length === 0
        ) {

            return;

        }


        const today = new Date();

        const futureDate =
            new Date(today);


        futureDate.setDate(
            today.getDate() + 90
        );


        const products =
            await Product.find({

                isActive: true,

                expiryDate: {

                    $gte: today,

                    $lte: futureDate

                }

            });


        for (
            const user of notificationUsers
        ) {

            for (
                const product of products
            ) {

                await notifyExpiringProduct(

                    product,

                    user._id,

                    90

                );

            }

        }


        console.log(
            "Expiry notification check completed."
        );


    } catch (error) {

        console.error(
            "Expiry notification check failed:",
            error.message
        );

    }

};


module.exports = {

    createNotification,

    createUniqueNotification,

    notifySaleCompleted,

    notifyPurchaseReceived,

    notifyLowStock,

    notifyExpiringProduct,

    checkProductNotifications,

    getNotifications,

    getUnreadNotifications,

    getUnreadCount,

    markAsRead,

    markAllAsRead,

    deleteNotification,

    runExpiryNotificationCheck

};