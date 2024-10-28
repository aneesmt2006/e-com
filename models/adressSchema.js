const mongoose = require("mongoose")
const Schema = mongoose.Schema

const adressSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    address:[{
        adressType:{
            type:string,
            required:true
        },
        name:{
            type:string,
            required:true
        },
        city:{
            type:string,
            required:true,
        },
        landmark:{
            type:string,
            required:true
        },
        state:{
            type:string,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        phone:{
            type:string,
            required:true
        },
        altphone:{
            type:string,
            required:true
        }

    }]
})

module.exports = mongoose.model("address",adressSchema)