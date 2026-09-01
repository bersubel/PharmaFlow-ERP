const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        purchasePrice: {
            type: Number,
            required: true,
            min: 0
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: true
    }
);


const purchaseSchema = new mongoose.Schema(
    {
        purchaseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true
        },

        items: {
            type: [purchaseItemSchema],
            required: true,
            validate: {
                validator: function(items) {
                    return items.length > 0;
                },
                message: "Purchase must contain at least one item"
            }
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        tax: {
            type: Number,
            default: 0,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        total: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "DRAFT",
                "RECEIVED",
                "CANCELLED"
            ],
            default: "DRAFT"
        },

        notes: {
            type: String,
            default: ""
        },

        receivedAt: {
            type: Date,
            default: null
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
    "Purchase",
    purchaseSchema
);