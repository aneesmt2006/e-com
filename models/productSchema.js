const mongoose = require("mongoose")
const Schema = mongoose.Schema


const productSchema = new Schema({
    productName : {
        type: String,
        required:true,
    },
    description: {
        type :String,
        required:true,
    },//dleted brand field
    category: {
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true,
    },
    regularPrice:{
        type:Number,
        required:true,
    },
    salePrice:{
        type:Number,
        required:true
    },
    productOffer : {
        type:Number,
        default:0,
    },
    quantity:{
        type:Number,
        default:true
    },
    size:{
        type:String,
        required:true
    },
    material:{
        type:String,
        required:true,
    },
    fit:{
        type:String,
        required:true
    },
    wash:{
        type:String,
        required:true,
    },
    color: {
        type:String,
        required:false
    },
    productImage:{
        type:[String],
        required:true,
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["Available","out of stock","Discountinued"],
        required:true,
        default:"Available"
    },
},{timestamps:true});// the timestamps option is used to automatically add and manage createdAt and updatedAt fields in your documents. When you enable timestamps, Mongoose will automatically track when a document is created and when it is updated, without you having to explicitly define or update those fields manually.
module.exports = mongoose.model('Product',productSchema)