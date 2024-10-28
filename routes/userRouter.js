const express = require("express")
const router = express.Router()
const userController = require("../controllers/user/userController")
const passport = require("passport")


router.get('/', userController.loadHomepage)
router.get('/signup',userController.loadSignup)
router.post('/signup',userController.submitSignup)
router.post('/verify-otp',userController. verifyOTP)
router.post('/resend-otp',userController.resendOtp)
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
})
router.get('/login',userController.loadLogin)
router.post('/login',userController.submitLogin)
router.get('/logout',userController.logOut)
// router.get('*',userController.notFound)










module.exports = router