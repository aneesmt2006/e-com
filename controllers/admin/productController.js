const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const storage = require("../../helpers/multer");
const sharp = require("sharp");
const uploads = multer({ storage });

const getProductAddPage = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true }); //finding the all listed category from database
    console.log("from getPRoduct page ");
    res.render("product-add", {
      cat: category,
    });
  } catch (error) {
    res.redirect("/admin/pageerror");
    console.log("internal sever error", error);
  }
};

//add products 
const addProducts = async (req, res) => {
  console.log("from addproducts");
  try {
    const Products = req.body;
    console.log('going to check if it exist')
    const ProductExists = await Product.findOne({
      productName: Products.name,
    });
    console.log(ProductExists,'it is')

    if (!ProductExists) {
      const images = [];
      console.log(req.files);
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const originalImagePath = req.files[i].path;

          const resizedImagePath = path.join(
            "public",
            "uploads",
            "re-image",
            req.files[i].filename
          );

          
          images.push(req.files[i].filename);
        }
      }
      console.log(images);
      const categoryId = await Category.findOne({ name: Products.category });
      if (!categoryId) {
        return res.status(400).join("Invalid category name ");
      }
      const newProduct = new Product({
        productName: Products.name,
        description: Products.description,
        category: categoryId._id,
        regularPrice: Products.regularPrice,
        salePrice: Products.salePrice,
        createdOn: new Date(),
        quantity: Products.quantity,
        size:Products.size,
        color: Products.color,
        wash:Products.wash,
        material:Products.material,
        fit:Products.fit,
        productImage: images,
        status: "Available",
      });

    

      await newProduct.save();
      console.log("saved databse");
      return res.json({ success: true, redirectUrl: "/admin/addProducts" });
    } else {
      return res.status(400).json({
        message: "Product alaready exist , pls try again with another ",
      });
    }
  } catch (error) {
    console.error("Error saving product", error);
    return res
      .status(500)
      .json({ success: false, message: "an error occured while add product " });
  }
};

//products listing page
const getallProducts = async (req, res) => {
   console.log("from product listing page")
  try {
    const { page = 1, limit = 5, search = "", status } = req.query;
     // Set up the query object based on search and status
        const query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" }; // Case-insensitive search by name
        }
        if (status) {
            query.status = status; // Filter by status (e.g., Active or Inactive)
        }

        // Fetch products with pagination and the constructed query
        const productData = await Product.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("category")
            .exec();

        // Count total matching products for pagination calculation
        const count = await Product.countDocuments(query);

        // Fetch categories (if necessary) and render the products page
        const category = await Category.find({ isListed: true });

    console.log("_________________")
    // console.log(productData)
    if(category){
        res.render('products',{
            data : productData,
            currentpage : page,
            totalpages:Math.ceil(count/limit),
            cat:category,
            
        })
    }else{
      res.render('page-404')
    }
    

    
  } catch(error) {
    console.log(error)
    res.redirect('/admin/pageerror')
  }
};

// Block products
const blockProduct = async(req,res)=>{
      try {
       const Id = req.query.id
       console.log(Id)
       const product = await Product.updateOne({_id:Id},{$set:{isBlocked:true}})
       res.redirect('/admin/products')

   
      } catch (error) {
        console.log(error)
        res.redirect('/admin/pageerror')
      }
}

//unblock Products 
const unblockProduct = async (req, res) => {
  try {
      const Id = req.query.id;

      // Update `isBlocked` status to false for unblocking
      const product = await Product.findByIdAndUpdate(Id, { isBlocked: false });
      res.redirect('/admin/products'); 

  } catch (error) {
      console.error('Error unblocking product:', error);
      res.status(500).send('Server error');
  }
};

// Edit products
const editProduct = async(req,res)=>{
  console.log("edit")
  try {
        editId = req.query.id
        const product = await Product.findOne({_id:editId}).populate('category')
        const category = await Category.find({})
       
       
        // console.log(product)
        // console.log(category)
        res.render('edit-product',{
          product:product,
          cat:category,
        })
       
  } catch (error) {
    console.log(error)
    res.redirect('/admin/pageerror')
  }
}

// Edit products submit 
const addEditProduct = async (req,res)=>{
  try {
    console.log("1")
    const id = req.params.id
    console.log("sec")
    console.log(id)
    console.log("third")
    const product = await Product.findOne({_id:id})
    console.log("four")
    const data = req.body
    const ProductExists =  await Product.findOne({productName:data.name,_id:{$ne:id}})
    if(ProductExists){
      console.log("product already exist with this same name")
      return res.status(400).json({message:'product with this same name already exist try with another name '})
    }

    const images = []

    if(req.files && req.files.length>0){
      for(let i=0;i<req.files.length;i++){
        images.push(req.files[i].filename)
      }
    }


    const updateFields ={
      productName:data.name,
      description:data.description,
      salePrice:data.salePrice,
      regularPrice:data.regularPrice,
      quantity:data.quantity,
      size:data.size,
    }

    if(req.files.length>0){
      updateFields.$push = {productImage:{$each:images}}
    }
    // console.log("2")
    // console.log(req.files)
    // if (req.files && req.files.length>0) {
    //   updateFields.productImages = req.files.map(file => file.filename); // Store all uploaded image paths in an array
    // }
    console.log(updateFields)
    console.log("3")
    const updatedProduct = await Product.findByIdAndUpdate(id,updateFields,{new:true})

    if(updatedProduct){

      return res.redirect('/admin/products')
    }else{
      return res.status(404).send('product NOt found')
    }
    


    
  } catch (error) {
    console.log(error)
    res.redirect('/admin/pageerror')
  }
}

module.exports = {
  getProductAddPage,
  addProducts,
  getallProducts,
  blockProduct,
  unblockProduct,
  editProduct,
  addEditProduct
};
