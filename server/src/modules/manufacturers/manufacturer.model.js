const mongoose = require("mongoose");


const manufacturerSchema = new mongoose.Schema(

    {

        name: {

            type: String,
            required: true,
            unique: true,
            trim: true

        },


        country: {

            type: String,
            default: ""

        },


        email: {

            type: String,
            lowercase: true,
            trim: true

        },


        phone: {

            type: String,
            default: ""

        },


        address: {

            type: String,
            default: ""

        },


        isActive: {

            type: Boolean,
            default: true

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
    "Manufacturer",
    manufacturerSchema
);