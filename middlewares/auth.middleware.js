const asyncHandler = require("express-async-handler");
const { ErrorHandler } = require("../utils/Errorhandler");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const USER_SCHEMA = require("../models/user.models");

exports.authenticate = asyncHandler(async (req, res, next) => {
  let cookie = req?.cookies?.cookie;
  if (!cookie) {
    return next(new ErrorHandler("Please log in First to access this", 409));
  }
  let decodedToken = jwt.verify(cookie, JWT_SECRET);
  let user = await USER_SCHEMA.findOne({ _id: decodedToken.id });
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  req.foundUser = user;
  next();
});

exports.authorize = asyncHandler(async (req, res, next) => {
  if (req.foundUser.role === "admin") next();
  else return next(new ErrorHandler("you are not authorized", 409));
});
