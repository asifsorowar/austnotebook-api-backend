const crypto = require("crypto");
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    uppercase: true,
  },
  lastName: {
    type: String,
    required: true,
    uppercase: true,
  },
  varsityId: {
    type: String,
    required: true,
    minlength: 9,
  },
  email: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.ObjectId,
    ref: "Department",
    required: true,
  },
  batch: {
    type: mongoose.Schema.ObjectId,
    ref: "Batch",
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  photo: {
    type: String,
    default: "nophoto.png",
  },
  role: {
    type: String,
    enum: ["user", "co-admin"],
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isAdmin: Boolean,
});

userSchema.methods.getJwtToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      varsityId: this.varsityId,
      department: this.department,
      batch: this.batch,
      email: this.email,
      photo: this.photo,
      role: this.role,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );

  return token;
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

userSchema.methods.getCookieOptions = function () {
  return {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPRIE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

const User = mongoose.model("User", userSchema);

const validate = (user) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .required()
      .regex(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/)
      .message("First name Only words characters allowed"),
    lastName: Joi.string()
      .required()
      .regex(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/)
      .message("Last name Only words characters allowed"),
    varsityId: Joi.string()
      .required()
      .min(9)
      .max(9)
      .regex(/^[0-9]+$/)
      .message("Invalid varsity id format"),
    email: Joi.string().email().required(),
    departmentId: Joi.objectId().required(),
    batchId: Joi.objectId().required(),
    password: Joi.string().required().min(5),
  });

  return schema.validate(user);
};

module.exports.validate = validate;
module.exports.User = User;
module.exports.userSchema = userSchema;
