const { body } = require("express-validator");

const createCategoryValidation = [

    body("name")
        .notEmpty()
        .withMessage("Category name is required")

];

module.exports = {
    createCategoryValidation
};