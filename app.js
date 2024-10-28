const express = require("express")
const app  = express()
const env =  require("dotenv").config()
const session =  require("express-session")
const flash = require("connect-flash")
const passport = require("./config/passport")
const path = require("path")
const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter')
const db = require("./config/db")
db()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))

app.use(flash());
app.use((req,res,next)=>{
    res.locals.error_msg = req.flash('error_msg')
    next()
})


app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next)=>{
    res.set('cache-control','no-store');
    next();
})

app.set('view engine', 'ejs')
app.set('views',[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')])
app.use(express.static(path.join(__dirname,'public')))


app.use('/',userRouter)//user routes
app.use('/admin',adminRouter)//admin routes


// app.use((req,res)=>{
//     res.status(400).render("page-404")
// })

app.listen(process.env.PORT,()=>{
    console.log("sever is running")
})  

module.exports = app

