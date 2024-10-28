const User = require("../../models/userSchema");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { session } = require("passport");


const loadHomepage = async (req, res) => {
  try {
    const user = req.session.user
    console.log(user)
    if(user){
      const userdata = await User.findOne({_id:user._id})
      let locals={
        user:userdata 
      }
      // return res.render("home",{user:userdata})
      return res.render("home",{locals})
    }else{
      return res.render("home");
    }
    
  } catch (error) {
    console.log("Home page Not Found"); // Identify error from backend
    res.status(500).send("Server error"); // Identify error in the front end
  }
};

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
        user: 'aneesanu2006@gmail.com',
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailDetails = {
      from:'aneesanu2006@gmail.com',
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
  console.log("hi ");
  try {
    const { name, password, phone, email } = req.body;
    console.log(email,password)

    const findUser = await User.findOne({ email });
    if (findUser) {
      req.flash("error_msg","email already exist")
      return res.redirect("/signup");
    }
    const otp = generateOtp();
    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.json("email-error");
    }

    req.session.userotp = otp;
    req.session.userdata = { name, email, password, phone };

    res.render("verify-otp");
    console.log("OTP sent", otp);
  } catch (error) {
    console.error("sugnup error from senderVErificationEmail");
    return res.redirect("/page-404");
  }
};

// load login page
const loadLogin = async (req,res)=>{
   try {
    console.log("dslhufi")
    if(!req.session.user){
     
      
      return res.render('home')
    }else{

  return res.redirect('/signup')
}
}
 catch (error) {
     res.redirect('/page-404')
   }
  }
// submit login form

const submitLogin = async (req,res)=>{
  try {
    console.log("from user side")
    const  {email,password}  = req.body
    console.log(email,password)
    const finduser = await User.findOne({isAdmin:0,email:email})
    if(!finduser){
      req.flash("error_msg","email does not exist")
       return res.redirect('/signup')
    }
    if(finduser.isBlocked){
      req.flash("error_msg","User is blocked by admin")
      return res.redirect('/signup')
    }

    const passwordMatch   =  await bcrypt.compare(password,finduser.password)
    if(!passwordMatch){
      req.flash("error_msg","Incorrect password")
      return res.redirect('/signup')
    }
    // req.session.user = finduser._id; // Store full user data in session
    console.log(req.session.user)
    // return res.rendirect('/'); // Redirect to homepage
    req.session.user = finduser._id
    console.log("000")
    let locals={
      user:true
    }
    res.render('home',{locals})
  } catch (error) {
    console.error("error occured while login")// msg for backend
    return res.render('signup',{message:"login failed ,pls try again"})
  }
}

// logout the session 

const logOut = async (req,res) =>{
      try {
        req.session.destroy((err)=>{
          if(err){
            console.error("error at session destroying",err.message)
            return res.redirect("/page-404")
          }
        })
        return res.redirect("/signup")

      } catch (error) {
        console.log("Logout error",error)
        return res.redirect("/page-404")
      }
}

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
    console.log(otp);

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
      return res.json({ success: true, redirectUrl: "/" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP,pls try again" });
    }
  } catch (error) {
    console.error("Error verifying OTP", error);
    return res
      .status(500)
      .json({ success: false, message: "An error occured at verfify otp " });
  }
};

// verify resend OTP function (it is passed from frontend , here it is check and )
const resendOtp = async (req, res) => {
    try {
      // Check if session data exists
      if (!req.session.userdata) {
        return res.status(400).json({
          success: false,
          message: "Session data is missing, please try signing up again.",
        });
      }
  
      // Destructure email from session data
      const { email } = req.session.userdata;
  
      // Generate new OTP
      const otp = generateOtp();
      req.session.userotp = otp;
  
      // Send OTP via email
      const emailSent = await sendVerificationEmail(email, otp);
      if (emailSent) {
        console.log("Resent OTP", otp);
        // Return response and stop further execution
        return res.status(200).json({
          success: true,
          message: "OTP has been resent successfully",
        });
      } else {
        // Return error response if OTP could not be sent
        return res.status(500).json({
          success: false,
          message: "Failed to resend OTP, please try again.",
        });
      }
    } catch (error) {
      // Log and return error response
      console.error("Error resending OTP", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error, please try again.",
      });
    }
  };
  
// for unrelated routes

module.exports = {
  loadHomepage,
  loadSignup,
  submitSignup,
  verifyOTP,
  resendOtp,
  loadLogin,
  submitLogin,
  logOut,
  // notFound,

   
};
