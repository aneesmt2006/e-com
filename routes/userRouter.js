const express = require("express")
const router = express.Router()
const userController = require("../controllers/user/userController")
const passport = require("passport")
const { userAuth } = require("../middlewares/auth")


router.get('/', userController.loadHomepage)
router.get('/login',userController.loadLogin)
router.post('/login',userController.submitLogin)
router.get('/logout',userController.logOut)
router.get('/signup',userController.loadSignup)
router.post('/signup',userController.submitSignup)
router.post('/verify-otp',userController. verifyOTP)
router.post('/resend-otp',userController.resendOtp)
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    // req.session.user = true
    res.redirect('/')
})

// router.get('*',userController.notFound)


//shop page 
router.get('/shop',userAuth,userController.loadShoppage)

// product details
router.get('/productDetails',userAuth,userController.productDetails)










module.exports = router