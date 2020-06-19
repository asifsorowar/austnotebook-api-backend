const { TeacherInfo, validate } = require("../models/teacherInfo");
const { Batch } = require("../models/batch");

const paramsIdCheck = require("../middleware/paramsIdCheck");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const express = require("express");
const router = express.Router({ mergeParams: true });

router.get("/", [auth, paramsIdCheck], async (req, res) => {
  let teacherInfos;

  if (req.params.batchId) {
    const batch = await Batch.findOne({ _id: req.params.batchId });
    if (!batch) return res.status(400).send("Invalid batch id");

    teacherInfos = await TeacherInfo.find({ batch: batch._id })
      .populate("batch")
      .sort("-section");
  } else {
    teacherInfos = await TeacherInfo.find({})
      .populate("batch")
      .sort("-section");
  }

  return res
    .status(200)
    .send({ count: teacherInfos.length, data: teacherInfos });
});

router.post("/", [auth, paramsIdCheck], async (req, res) => {
  let batch;
  if (req.params.batchId) {
    batch = await Batch.findOne({ _id: req.params.batchId });
  } else {
    batch = await Batch.findById(req.body.batchId);
  }
  if (!batch) return res.status(400).send("Invalid batch id");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let teacherInfos = new TeacherInfo({
    name: req.body.name,
    courseTitle: req.body.courseTitle,
    courseNo: req.body.courseNo,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    batch: batch._id,
  });

  await teacherInfos.save();

  teacherInfos = await teacherInfos.getPopulatedData();
  res.status(200).send(teacherInfos);
});

router.put("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  let batch;
  if (req.params.batchId) {
    batch = await Batch.findOne({ _id: req.params.batchId });
    if (!batch) return res.status(400).send("Invalid batch id");
  } else {
    batch = await Batch.findById(req.body.batchId);
    if (!batch) return res.status(400).send("Invalid batch id");
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let teacherInfo = await TeacherInfo.findById(req.params.id);
  if (!teacherInfo) return res.status(400).send("Invalid teacherInfo id");

  teacherInfo = await TeacherInfo.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        courseTitle: req.body.courseTitle,
        courseNo: req.body.courseNo,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
      },
      $currentDate: {
        lastEdited: true,
      },
    },
    { new: true, runValidators: true }
  );

  teacherInfo = await teacherInfo.getPopulatedData();
  return res.status(201).send(teacherInfo);
});

router.delete("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.batchId) {
    const batch = await Batch.findOne({ _id: req.params.batchId });
    if (!batch) return res.status(404).send("Invalid batch id");
  }

  const teacherInfo = await TeacherInfo.findByIdAndDelete(req.params.id);
  if (!teacherInfo)
    return res.status(404).send("No teacherInfo found of this id");
  return res.status(200).send(teacherInfo);
});

router.get("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.batchId) {
    const batch = await Batch.findOne({ _id: req.params.batchId });
    if (!batch) return res.status(400).send("Invalid batch id");
  }

  const teacherInfo = await TeacherInfo.findById(req.params.id).populate(
    "batch"
  );
  if (!teacherInfo)
    return res.status(404).send("No teacherInfo found of this id");

  return res.status(200).send(teacherInfo);
});

module.exports = router;
