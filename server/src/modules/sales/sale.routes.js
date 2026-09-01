const express = require("express");

const router = express.Router();

const protect = require("../../middleware/protect");
const permission = require("../../middleware/permission.middleware");

const {
    createSale,
    getSales,
    getSale,
    updateSale,
    completeSale,
    cancelSale,
} = require("./sale.controller");


/* =========================================================
   ALLOW ANY ONE OF MULTIPLE PERMISSIONS
========================================================= */

const anyPermission = (...requiredPermissions) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const userPermissions =
            req.user.role?.permissions || [];

        const hasPermission =
            requiredPermissions.some((requiredPermission) =>
                userPermissions.includes(requiredPermission)
            );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to perform this action",
            });
        }

        next();
    };
};


/* =========================================================
   GET ALL SALES

   Admin / Manager:
   sales.manage

   Pharmacist / Cashier:
   sales.create
========================================================= */

router.get(
    "/",
    protect,
    anyPermission(
        "sales.manage",
        "sales.create"
    ),
    getSales
);


/* =========================================================
   CREATE SALE

   Admin / Manager:
   sales.manage

   Pharmacist / Cashier:
   sales.create
========================================================= */

router.post(
    "/",
    protect,
    anyPermission(
        "sales.manage",
        "sales.create"
    ),
    createSale
);


/* =========================================================
   GET ONE SALE

   Admin / Manager:
   sales.manage

   Pharmacist / Cashier:
   sales.create
========================================================= */

router.get(
    "/:id",
    protect,
    anyPermission(
        "sales.manage",
        "sales.create"
    ),
    getSale
);


/* =========================================================
   UPDATE SALE

   Only users with sales.manage

   Admin / Manager
========================================================= */

router.put(
    "/:id",
    protect,
    permission("sales.manage"),
    updateSale
);


/* =========================================================
   COMPLETE SALE

   Admin / Manager:
   sales.manage

   Pharmacist / Cashier:
   sales.create
========================================================= */

router.patch(
    "/:id/complete",
    protect,
    anyPermission(
        "sales.manage",
        "sales.create"
    ),
    completeSale
);


/* =========================================================
   CANCEL SALE

   Admin / Manager:
   sales.manage

   Pharmacist / Cashier:
   sales.create
========================================================= */

router.patch(
    "/:id/cancel",
    protect,
    anyPermission(
        "sales.manage",
        "sales.create"
    ),
    cancelSale
);


module.exports = router;