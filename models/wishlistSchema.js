const mongoose = require("mongoose")
const { string } = require("three/webgpu")
const Schema = mongoose.Schema


const WishlistSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[{
        productId:{
            type:Schema.Types.ObjectId,
            ref:"Product",
            required:true,
        },
        addedOn:{
            type:Date,
            default:Date.now
        }
    }]
})

module.exports = mongoose.model("Wishlist",WishlistSchema)