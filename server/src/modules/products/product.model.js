const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(

{

    name: {

        type:String,
        required:true,
        trim:true

    },


    genericName: {

        type:String,
        default:""

    },


    barcode: {

        type:String,
        unique:true,
        sparse:true

    },


    category: {

        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true

    },


    brand: {

        type:mongoose.Schema.Types.ObjectId,
        ref:"Brand"

    },


    manufacturer: {

        type:mongoose.Schema.Types.ObjectId,
        ref:"Manufacturer"

    },


    supplier: {

        type:mongoose.Schema.Types.ObjectId,
        ref:"Supplier"

    },


    unit: {

        type:mongoose.Schema.Types.ObjectId,
        ref:"Unit",
        required:true

    },


    purchasePrice: {

        type:Number,
        required:true,
        default:0

    },


    sellingPrice: {

        type:Number,
        required:true,
        default:0

    },


    quantity: {

        type:Number,
        default:0

    },


    reorderLevel: {

        type:Number,
        default:10

    },


    batchNumber: {

        type:String,
        default:""

    },


    expiryDate: {

        type:Date

    },


    description: {

        type:String,
        default:""

    },


    isActive: {

        type:Boolean,
        default:true

    },


    createdBy: {

        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true

    }


},

{

    timestamps:true

}

);



module.exports = mongoose.model(
    "Product",
    productSchema
);