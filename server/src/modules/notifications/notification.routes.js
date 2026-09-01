const express = require("express");

const router =
    express.Router();


const protect =
    require("../../middleware/auth.middleware");


const {

    getNotifications,

    getUnreadNotifications,

    getUnreadCount,

    markAsRead,

    markAllAsRead,

    deleteNotification

} = require("./notification.controller");


router.get(
    "/",
    protect,
    getNotifications
);


router.get(
    "/unread",
    protect,
    getUnreadNotifications
);


router.get(
    "/unread/count",
    protect,
    getUnreadCount
);


router.patch(
    "/read-all",
    protect,
    markAllAsRead
);


router.patch(
    "/:id/read",
    protect,
    markAsRead
);


router.delete(
    "/:id",
    protect,
    deleteNotification
);


module.exports = router;