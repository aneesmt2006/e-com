
const User  = require("../models/userSchema")

const userAuth = (req,res,next)=>{
    if(req.session.user){// req.sesion.user = finduser._id (in user login submit )
      User.findById(req.session.user)// check the user in the database (bcoz if may admin deleted the user, the user goes back automatically  )
      .then((data)=>{
        if(data && !data.isBlocked){
            next()
        }else{
            res.redirect('/signup')
        }
      }).catch((error)=>{
        console.log("error in user authentication")
        res.send(500).send("Internal sever error(in auth)")
      })
    }else{
        res.redirect('/signup')
    }
}

const adminAuth = (req,res,next)=>{
    User.findOne({isAdmin:true})
    .then((data)=>{
        if(data){
            next()
        }else{
            res.redirect('/admin-login')
        }
    }).catch((error)=>{
        console.log("error in admin auth middleware")
        res.status(500).send("Internal server error")
    })
}

module.exports = {
    adminAuth,
    userAuth
}