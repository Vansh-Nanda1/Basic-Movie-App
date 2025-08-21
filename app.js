const express = require("express");
const connectDB = require("./config/database");
const { error } = require("./middlewares/error.middleware");
const UserRoutes = require("./router/user.router");
const MovieRoutes = require("./router/movie.router")
const { PORT } = require("./config");
const cookieParser = require("cookie-parser")
connectDB()
const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json())     
app.use(cookieParser())
app.use("/auth",UserRoutes)  
app.use("/movies",MovieRoutes)
app.use(error)   

app.listen(PORT,(err)=>{
    if(err) console.log("error while starting their server",err)
    console.log("server running.....at 9000");
})


