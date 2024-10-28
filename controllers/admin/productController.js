const Products = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
const User = require("../../models/userSchema")
const fs = require("fs")
const path = require("path")

const getProductAddPage = async (req,res)=>{
    try {
        const category = await Category.find({isListed:true})//finding the all listed category from database 

        res.render("product-add",{
            cat:category
        })
    } catch (error) {
        res.redirect('/admin/pageerror')
        console.log("internal sever error",error)
    }
}

module.exports = {
    getProductAddPage,
}