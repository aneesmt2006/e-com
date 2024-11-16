const User = require("../../models/userSchema");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Cart = require('../../models/cartSchema')
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { session } = require("passport");

const loadHomepage = async (req, res) => {
  try {
    // const user = req.session.user;
    console.log(req.session)
    // console.log("in load home page===>", user);
    const categories = await Category.find({ isListed: true });
    let productData = await Product.find({
      isBlocked: false,
      category: { $in: categories.map((category) => category._id) },
    
    }).populate("category");
    productData.sort((a, b) => b.createdAt - a.createdAt);
    productData = productData.slice(0, 7);
    const user = await User.findOne({ _id: req.session.user });
   
      return res.render("home", {
      
        user: user,
        products: productData,
      });
   
  } catch (error) {
    console.log("Home page Not Found", error); // Identify error from backend
    res.status(500).send("Server error"); // Identify error in the front end
  }
};

//load shop page
const loadShoppage = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from query params, default to 1
  const limit = 5; // Number of products per page
  const skip = (page - 1) * limit; // Number of products to skip for pagination
  try {
    const user = req.session.user;
    console.log("in load shop page===>", user);

    const categories = await Category.find({ isListed: true });

    const totalProducts = await Product.find({
      isBlocked: false,
    }).countDocuments();
    const totalPages = Math.ceil(totalProducts / limit); // Calculate total pages

    let productData = await Product.find({
      isBlocked: false,
      category: { $in: categories.map((category) => category._id) },
      
    })
      .skip(skip)
      .limit(limit)
      .populate("category");

    productData.sort((a, b) => b.createdAt - a.createdAt);
    productData = productData.slice(0, 9);

    
      const userdata = await User.findOne({ _id: user });

      // let locals = {
      //   user: true,
      //   products: productData,
      // };
      console.log(productData);

      return res.render("shop", {
  
        user: userdata,
        products: productData,
        totalProducts: totalProducts,
        totalPages: totalPages,
        page: page,
      });
    
  } catch (error) {
    console.log("shop page Not Found", error); // Identify error from backend
    res.status(500).send("Server error"); // Identify error in the front end
  }
};

// product details

const productDetails = async (req, res) => {
  try {
    // const user = ;
    // console.log(user);
    const id = req.query.id;
    const products = await Product.findOne({ _id: id, isBlocked: false }).populate("category");

    const fulldata = await Product.find({isBlocked:false}).populate("category");

    // if (!productData) {
    //   // If product is not found or blocked, redirect to another page or show an error message
    //   return res.redirect('/'); // or replace with any relevant route, e.g., '/not-found'
    // }
   const user=await User.findById(req.session.user)
      res.render("product-details",{user,products})
      
   
  } catch (error) {
    console.log(error);
    res.send(500).send("internal Server error");
  }
};

// ADD TO CART 
const addTocart = async(req,res)=>{
  const userId = req.session.user
  const { productId,quantity }= req.body

  if(!userId){
    alert('plss log in')
    return res.status(401).json({error:'pls login first',re})
  }

  try {
    let cart = await Cart.findOne({userId})
    let product = await Product.findOne({_id:productId})


    if(!product){
      res.status(404).send({message:'Product not found'})//check the product is or not 
    }

    const price = Product.salePrice;
    const name = Product.name;

    if(!cart){// create a new cart for the user 
        cart = new Cart({
          userId,
          items:[{productId,quantity:1,name,price}]
        })
    }else{    //comes to else case means the user have cart then,check the product already in the cart 
      const itemIndex  = cart.items.findIndex((item)=>item.productId.toString()===productId)

      // check product exist or not 
      if(itemIndex > -1){
        return res.redirect('/shop')//producr already in the cart redirect to cart page 
      }else{
        //product not in the cart ,so add it 
        cart.items.push({productId,quantity:1})

        
      }

    }
    await cart.save();
    res.redirect('/shop')


  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }

}
































//funtion for generate OTP
function generateOtp() {
  return Math.floor(3000 + Math.random() * 900).toString();
}

const loadSignup = async (req, res) => {
  try {
    return res.render("signup");
  } catch (error) {
    console.log("error from login page");
    res.status(500).send("Server error");
  }
};
//function for sendvaerificaationemail(function to create a Transporter who will send the mail )

async function sendVerificationEmail(email, otp) {
  try {
    const mailTransporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: "aneesanu2006@gmail.com",
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailDetails = {
      from: "aneesanu2006@gmail.com",
      to: email,
      subject: "VERIFY YOUR ACCOUNT",
      text: `YOUR OTP IS ${otp}`,
      html: `<b>YOUR OTP IS ${otp}</b>`,
    };

    const info = await mailTransporter.sendMail(mailDetails);

    return info.accepted.length > 0;
  } catch (error) {
    console.error("Error sending email", error);
    return false;
  }
}

//submit the signup form
const submitSignup = async (req, res) => {
  try {
    const { name, password, phone, email } = req.body;

    const findUser = await User.findOne({ email });
    if (findUser) {
      req.flash("error_msg", "Email already exists");
      return res.redirect("/signup");
    }

    const otp = generateOtp();
    console.log(otp)
    const otpExpiration = Date.now() + 2 * 60 * 1000; // 2 minutes

    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.json("email-error");
    }

    req.session.userotp = otp;
    req.session.expire = otpExpiration;
    req.session.userdata = { name, email, password, phone };
     
    const start = true
    res.render("verify-otp", { start });
  } catch (error) {
    console.error("Signup error:", error);
    res.redirect("/page-404");
  }
};

// const submitSignup = async (req, res) => {
//   console.log("in submit signup ------");
//   try {
//     const { name, password, phone, email } = req.body;
//     console.log(name, password);
//     const findUser = await User.findOne({ email });
//     console.log(findUser);

//     if (findUser) {
//       req.flash("error_msg", "email already exist");
//       return res.redirect("/signup");
//     }
//     const otp = generateOtp();
//     const otpExpiration = Date.now() + 60 * 1000
//     const emailSent = await sendVerificationEmail(email, otp);

//     if (!emailSent) {
//       return res.json("email-error");
//     }

//     req.session.userotp = otp;
//     req.session.expire = otpExpiration
//     req.session.userdata = { name, email, password, phone };

//     res.render("verify-otp",req.session.expire);
//     console.log("OTP sent", otp);
//   } catch (error) {
//     console.error("sugnup error from senderVErificationEmail", error);
//     return res.redirect("/page-404");
//   }
// };

// load login page
const loadLogin = async (req, res) => {
  try {
    console.log("login page");
    if (!req.session.user) {
      return res.render("home");
    } else {
      return res.redirect("/signup");
    }
  } catch (error) {
    res.redirect("/page-404");
  }
};
// submit login form

const submitLogin = async (req, res) => {
  try {
    console.log("from user side");
    const { email, password } = req.body;
    console.log(email, password);


    const user = await User.findOne({ isAdmin: 0, email: email });
   
    console.log("in load submit login  page===>");


    const categories = await Category.find({ isListed: true });

    let productData = await Product.find({
      isBlocked: false,
      category: { $in: categories.map((category) => category._id) },
      quantity: { $gt: 0 },
    }).populate("category");

    productData.sort((a, b) => b.createdAt - a.createdAt);
    productData = productData.slice(0, 7);



    if (!user) {
      req.flash("error_msg", "email does not exist");
      return res.redirect("/signup");
    }
    if (user.isBlocked) {
      req.flash("error_msg", "User is blocked by admin");
      return res.redirect("/signup");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      req.flash("error_msg", "Incorrect password");
      return res.redirect("/signup");
    }
    req.session.user = user._id; // Store full user data in session
    console.log(req.session.user);
    // return res.rendirect('/'); // Redirect to homepage

    console.log("000");
   
    res.redirect("/");
  } catch (error) {
    console.error("error occured while login",error); // msg for backend
    return res.render("signup", { message: "login failed ,pls try again" });
  }
};

// logout the session

const logOut = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("error at session destroying", err.message);
        return res.redirect("/page-404");
      }
    });
    return res.redirect("/signup");
  } catch (error) {
    console.log("Logout error", error);
    return res.redirect("/page-404");
  }
};

// step 2, for hash password

const securePassword = async (password) => {
  try {
    const passwordHash = bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

// step :1 , check the frondend user otp is equal to backend otp / verify otp
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!req.session.userotp || !req.session.expire) {
      return res
        .status(400)
        .json({ success: false, message: "Session expired. Please resend OTP." });
    }

    const currentTime = Date.now();

    if (currentTime > req.session.expire) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired. Please resend." });
    }

    if (otp === req.session.userotp) {
      const user = req.session.userdata;
      const passwordHash = await securePassword(user.password);

      const saveUserdata = new User({
        name: user.name,
        email: user.email,
        password: passwordHash,
        phone: user.phone,
      });
      await saveUserdata.save();

      req.session.user = saveUserdata._id;
      req.session.userotp = null; // Clear OTP
      req.session.expire = null;

      return res.json({ success: true, redirectUrl: "/" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    console.error("Error verifying OTP", error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred during OTP verification." });
  }
};


// const verifyOTP = async (req, res) => {
//   try {
//     const { otp } = req.body;
//     console.log(otp);

//     if (otp === req.session.userotp) {
//       const user = req.session.userdata;
//       const passwordHash = await securePassword(user.password);
//       const saveUserdata = new User({
//         name: user.name,
//         email: user.email,
//         password: passwordHash,
//         phone: user.phone,
//       });
//       await saveUserdata.save();
//       req.session.user = saveUserdata._id;
//       return res.json({ success: true, redirectUrl: "/" });
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid OTP,pls try again" });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "An error occured at verfify otp " });
//   }
// };

// verify resend OTP function (it is passed from frontend , here it is check and )
const resendOtp = async (req, res) => {
  try {
    const user = req.session.userdata;

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Session expired. Please signup again." });
    }

    const otp = generateOtp();
    console.log(otp)
    const otpExpiration = Date.now() + 2 * 60 * 1000; // 2 minutes

    const emailSent = await sendVerificationEmail(user.email, otp);

    if (!emailSent) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to resend OTP. Try again later." });
    }

    req.session.userotp = otp;
    req.session.expire = otpExpiration;

    return res.json({ success: true });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred while resending OTP." });
  }
};

// const resendOtp = async (req, res) => {
//   try {
//     // Check if session data exists
//     if (!req.session.user) {
//       return res.status(400).json({
//         success: false,
//         message: "Session data is missing, please try signing up again.",
//       });
//     }

//     // Destructure email from session data
//     const { email } = req.session.user;

//     // Generate new OTP
//     const otp = generateOtp();
//     req.session.userotp = otp;

//     // Send OTP via email
//     const emailSent = await sendVerificationEmail(email, otp);
//     if (emailSent) {
//       console.log("Resent OTP", otp);
//       // Return response and stop further execution
//       return res.status(200).json({
//         success: true,
//         message: "OTP has been resent successfully",
//       });
//     } else {
//       // Return error response if OTP could not be sent
//       return res.status(500).json({
//         success: false,
//         message: "Failed to resend OTP, please try again.",
//       });
//     }
//   } catch (error) {
//     // Log and return error response
//     console.error("Error resending OTP", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error, please try again.",
//     });
//   }
// };

// for unrelated routes

module.exports = {
  loadHomepage,
  loadShoppage,
  loadSignup,
  submitSignup,
  verifyOTP,
  resendOtp,
  loadLogin,
  submitLogin,
  logOut,
  productDetails,
  // notFound,
};
