const mongoose = require("mongoose");
const Schema = mongoose.Schema

const CartSchema = Schema({
    userId :{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[{
        productId:{
            type:Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            default:1
        },
        price:{
            type:Number,
            required:true
        },
        totalPrice:{
            type:Number,
            required:true
        },
        status:{
            type :String,
            default:'placed'
        },
        cancellationReason:{
            type:String,
            default:"none"
        },
        

    }]

})

module.exports  = mongoose.model("Cart",CartSchema)

