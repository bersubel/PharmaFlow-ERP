const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(

    {

        product: {

            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true

        },

        type: {

            type: String,

            enum: [

                "IN",

                "OUT"

            ],

            required: true

        },

        quantity: {

            type: Number,

            required: true,

            min: 1

        },

        reference: {

            type: String,

            default: ""

        },

        remarks: {

            type: String,

            default: ""

        },

        createdBy: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        }

    },

    {

        timestamps: true

    }

);

module.exports = mongoose.model(
    "Inventory",
    inventorySchema
);