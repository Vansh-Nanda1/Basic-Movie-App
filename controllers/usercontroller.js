const uSerSchema = require("../models/user.models");
const asyncHandler = require("express-async-handler");
const { ErrorHandler } = require("../utils/Errorhandler");
const { generateToken } = require("../utils/jwt");

//! User Functionality
//! ================================ register user ===============================================================================
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { email, name, password, role } = req.body;

  let existingUser = await uSerSchema.findOne({ email });
  if (existingUser) {
    return next(
      new ErrorHandler("User already exists please use another email", 409)
    );
  }

  let newUser = await uSerSchema.create(req.body)
  res
    .status(201)
    .json({ sucess: true, message: "User Created Sucessfully", data: newUser });
});


//! ================================ login user ===========================================================
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser = await uSerSchema.findOne({ email });
  if (!existingUser) {
    return next(new ErrorHandler("User not found", 404));
  }
  let isPasswordMatched = await existingUser.matchPassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect Password", 409));
  }

  let token = generateToken(existingUser._id);
  res.cookie("cookie", token, {
    httpOnly: true,  
    maxAge: 24 * 60 * 60 * 1000,
  });
  res
    .status(201)
    .json({ sucess: true, message: "user login successfully", token: token });
});


//! ================================ logout user ============================================================
exports.logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("cookie", "", {
    maxAge: Date.now(),
  });
  res.status(200).json({
    success: true,
    message: "user logged out Successfully",
  });
});
