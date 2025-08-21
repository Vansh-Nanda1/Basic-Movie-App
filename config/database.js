const mongoose = require("mongoose")
const { MONGODB_URL } = require(".")

const connectDB = async (req,res) =>{
await mongoose.connect(MONGODB_URL)
console.log("DataBase Succesfully Connected for Todo App")
}

module.exports = connectDB

