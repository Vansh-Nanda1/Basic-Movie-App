const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const uSerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      lowercase: true,
      enum: ["admin", "user"],
      trim: true,
      default: "user",
    },
  },
  { timestamps: true }
);
//! password hashing
uSerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    //* if password field is not modifying then don't execute this function
  }
  let salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
});
//! password verification
uSerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = model("User", uSerSchema);







