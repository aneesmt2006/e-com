const mongoose = require("mongoose");
const { string } = require("three/webgpu");
const Schema = mongoose.Schema

const couponSchema = new Schema({
       name:{
        type:string,
        required:true,
        unique:true
       },
       createOn:{
        type:Date,
        default:Date.now,
        required:true
       },
       expiresOn:{
        type:Date,
        required:true
       },
       offerPrice:{
        type:Number,
        required:true
       },
       minimumPrice:{
        type:Number,
        required:true
       },
       isList:{
        type:Boolean,
        default:true
       },
       userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
       }
})

module.exports = mongoose.model("Coupon",couponSchema)