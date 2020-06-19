const crypto = require("crypto");
const Joi = require("@hapi/joi");
const sendEmail = require("../utils/sendEmail");

const { User } = require("../models/user");

const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validateForgotPassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email }).select(
    "-password"
  );
  if (!user) return res.status(404).send("There is no user with that email");

  const resetToken = user.getResetPasswordToken();

  await user.save();

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/forgotPassword/${resetToken}`;
  const html = "AustNoteBook - Reset Password";
  const message = `Please go to the link: ${resetUrl} for resetting your password`;

  try {
    await sendEmail({
      email: user.email,
      subject: "AustNoteBook Password reset token",
      message,
      html,
    });

    return res.status(200).send("Email send successfully");
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).send("Email could not be send");
  }
});

router.put("/:resetToken", async (req, res) => {
  const { error } = validateResetPassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) return res.status(400).send("Invalid token");

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getJwtToken();
  const options = user.getCookieOptions();
  return res.status(200).cookie("token", token, options).send(token);
});

const validateResetPassword = (user) => {
  const schema = Joi.object({
    password: Joi.string().required().min(5),
  });
  return schema.validate(user);
};

const validateForgotPassword = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(user);
};

module.exports = router;
