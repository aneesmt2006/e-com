
const User  = require("../models/userSchema")

const userAuth = async(req,res,next)=>{
    if(req.session.user){// req.sesion.user = finduser._id (in user login submit )
      User.findById(req.session.user)// check the user in the database (bcoz if may admin deleted the user, the user goes back automatically  )
      .then((data)=>{
        if(data && !data.isBlocked){
            next()
        }else if(data && data.isBlocked){
            req.flash("error_msg","you have blocked")
       return   res.redirect('/signup')
        }
        else{
            res.redirect('/signup')
        }
      }).catch((error)=>{
        console.log("error in user authentication")
        res.status(500).send("Internal sever error(in auth)")
      })
    }else{
        next()
    }
}

const adminAuth = (req,res,next)=>{

    if(req.session.admin){
        next()
    }else{
        res.redirect('/admin')
    }
    // User.findOne({isAdmin:true})
    // .then((data)=>{
    //     if(data){
    //         next()
    //     }else{
    //         res.redirect('/admin/adminlogin')
    //     }
    // }).catch((error)=>{
    //     console.log("error in admin auth middleware",error)
    //     res.status(500).send("Internal server error")
    // })
}

module.exports = {
    adminAuth,
    userAuth
}