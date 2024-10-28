const User = require("../../models/userSchema")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")


const pageError = (req,res)=>{
    res.render('admin-error')
}



// admin login 
const loadLogin = async (req,res)=>{
    
        if(req.session.admin){                      //check the admin is already loggined
            return res.redirect('/dashboard')
        }


        return res.render('admin-login',{message:"null"}) // here there is no chance to become error while loding a admin login page thats why catch block is not here


}

//admin login submit
const adminlogin = async(req,res)=>{
    console.log('from admin login side')
    try {
      const   {email,password}  = req.body
      const admindata = await User.findOne({email,isAdmin:true})
      if(admindata){
        const passwordMatch = bcrypt.compare(password,admindata.password)// first password is destrucring pass, 2nd - find from admindata through query
       if(passwordMatch){
        req.session.admin = true 
        return res.redirect('/admin/dashboard')
       }else{
        return res.render('admin-login',{message:'password is incorrect'})
       }
      }else{
        return res.render('admin-login',{message:'email is incorrect'})
      }

    } catch (error) {
        console.error("login error",error)
        return res.redirect('/admin-error')
    } 
}

// admin logout 
const adminLogout = (req,res)=>{
    console.log("going  to logout")
   try {
    req.session.destroy((err)=>{
        if(err){
            console.log("error from session destroy",err)
            return res.redirect('/admin/pageerror')
        }
        return res.redirect('/admin')
    })
   } catch (error) {
        console.log("unexpeced error during logout",error)
        res.redirect("/admin/pageerror")
   }
}

// dashBoard getting
const loadDashboard  =  async (req,res) =>{
    if(req.session.admin){
        try {
            return res.render('dashboard')
        } catch (error) {
            return res.redirect('/admin-error')
        }
    }
}

module.exports = {
    loadLogin,
    adminlogin,
    loadDashboard,
    adminLogout,
    pageError,
}