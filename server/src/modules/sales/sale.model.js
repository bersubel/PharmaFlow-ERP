const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: true,
    }
);

const saleSchema = new mongoose.Schema(
    {
        saleNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        /*
         * CUSTOMER IS OPTIONAL
         *
         * null = walk-in customer
         */
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            default: null,
        },

        items: {
            type: [saleItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return (
                        Array.isArray(items) &&
                        items.length > 0
                    );
                },
                message:
                    "A sale must contain at least one item",
            },
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        tax: {
            type: Number,
            default: 0,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            enum: [
                "CASH",
                "CARD",
                "TRANSFER",
                "CREDIT",
            ],
            default: "CASH",
        },

        paymentStatus: {
            type: String,
            enum: [
                "PAID",
                "PARTIAL",
                "UNPAID",
            ],
            default: "PAID",
        },

        status: {
            type: String,
            enum: [
                "DRAFT",
                "COMPLETED",
                "CANCELLED",
            ],
            default: "DRAFT",
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Sale",
    saleSchema
);