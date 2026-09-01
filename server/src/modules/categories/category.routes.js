const express = require("express");

const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const permission = require("../../middleware/permission.middleware");

const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    updateStatus,
    deleteCategory
} = require("./category.controller");

const {
    createCategoryValidation
} = require("./category.validation");

const { validationResult } = require("express-validator");

const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({
            success: false,
            errors: errors.array()
        });

    }

    next();

};

router.get("/", protect, getCategories);

router.get("/:id", protect, getCategory);

router.post(
    "/",
    protect,
    permission("products.manage"),
    createCategoryValidation,
    validate,
    createCategory
);

router.put(
    "/:id",
    protect,
    permission("products.manage"),
    updateCategory
);

router.patch(
    "/:id/status",
    protect,
    permission("products.manage"),
    updateStatus
);

router.delete(
    "/:id",
    protect,
    permission("products.manage"),
    deleteCategory
);

module.exports = router;