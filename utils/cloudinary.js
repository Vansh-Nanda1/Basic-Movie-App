const { v2 } = require("cloudinary");
const fs = require("fs");
const {
  CLOUDINARY_NAME,
  CLOUDINARY_API,
  CLOUDINARY_API_SECRET,
} = require("../config/index");
const asyncHandler = require("express-async-handler");

v2.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API,
  api_secret: CLOUDINARY_API_SECRET,
});

exports.uploadOnCloudinary = asyncHandler(async (path) => {
  if (!path) return null;
  let response = await v2.uploader.upload(path, {
    resource_type: "auto",
  });
  if (response) {
    fs.unlinkSync(path);   
  }
  return response;
});


exports.deleteProfilePicture = asyncHandler(async (id) => {
  let response = await v2.uploader.destroy(id);
  return response;
});
