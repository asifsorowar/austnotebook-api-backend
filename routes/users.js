const path = require("path");
const _ = require("lodash");
const { validate, User } = require("../models/user");
const { Department } = require("../models/department");
const { Batch } = require("../models/batch");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate(["department", "batch"])
    .select("-password");
  return res.status(200).send(user);
});

router.put("/me/photo", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!req.files) return res.status(400).send("Please upload an image");
  const file = req.files.file;
  if (!file.mimetype.startsWith("image"))
    return res.status(400).send("Please upload an image, not other file");
  if (file.size > process.env.PHOTO_SIZE)
    return res
      .status(400)
      .send(
        `Please upload a photo less than ${process.env.PHOTO_SIZE / 1000000}Mb.`
      );
  file.name = `photo_${user._id}${path.parse(file.name).ext}`;
  await file.mv(`${process.env.PHOTO_UPLOAD_PATH}/${file.name}`);
  await User.findByIdAndUpdate(user._id, {
    $set: {
      photo: file.name,
    },
  });

  res.status(200).send(file.name);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    email: req.body.email,
  });
  if (user) return res.status(400).send("email already taken");

  let user = await User.findOne({
    varsityId: req.body.varsityId,
  });
  if (user) return res.status(400).send("Varsity Id already taken");

  const department = await Department.findById(req.body.departmentId);
  if (!department) return res.status(400).send("Invalid department");

  const batch = await Batch.findById(req.body.batchId);
  if (!batch) return res.status(400).send("Invalid batch");

  if (batch.department.toString() !== department._id.toString())
    return res.status(400).send("Invalid department and batch relation");

  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    varsityId: req.body.varsityId,
    department: req.body.departmentId,
    batch: req.body.batchId,
    email: req.body.email,
    password: req.body.password,
  });

  await user.save();

  const token = user.getJwtToken();
  const options = user.getCookieOptions();

  return res
    .status(200)
    .cookie("token", token, options)
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(
      _.pick(user, [
        "_id",
        "firstName",
        "lastName",
        "email",
        "varsityId",
        "department",
        "batch",
      ])
    );
});

module.exports = router;
