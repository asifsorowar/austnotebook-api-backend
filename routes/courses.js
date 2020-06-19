const { Course, validate } = require("../models/course");
const { Batch } = require("../models/batch");
const paramsIdCheck = require("../middleware/paramsIdCheck");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");

const express = require("express");
const router = express.Router({ mergeParams: true });

// Note Route assigned
//Question Route assigned
const noteRoute = require("./notes");
const questionRoute = require("./questions");
const commentRoute = require("./comments");
router.use("/:courseId/notes", noteRoute);
router.use("/:courseId/questions", questionRoute);
router.use("/:courseId/comments", commentRoute);

//All course
// /api/batches/:batchId/courses
router.get("/", [auth, paramsIdCheck], async (req, res) => {
  let courses;

  if (req.params.batchId) {
    const batch = await Batch.findById(req.params.batchId);
    if (!batch) return res.status(400).send("Invalid batch Id");

    courses = await Course.find({ batch: batch._id })
      .populate([{ path: "batch", select: "_id name" }, "department"])
      .sort("courseTitle");
  } else {
    courses = await Course.find({})
      .populate([{ path: "batch", select: "_id name" }, "department"])
      .sort("courseTitle");
  }

  return res.send({ count: courses.length, data: courses });
});

// api/courses/
// api/batches/:batchId/courses
router.post("/", [auth, paramsIdCheck], async (req, res) => {
  let batch;
  if (req.params.batchId) {
    batch = await Batch.findById(req.params.batchId);
  } else {
    batch = await Batch.findById(req.body.batchId);
  }
  if (!batch) return res.status(400).send("Invalid batch Id");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const courseIsExist = await Course.find({
    courseTitle: req.body.courseTitle,
    batch: batch._id,
  });
  if (courseIsExist[0])
    return res.status(400).send("A subject is exist with this name");

  let course = new Course({
    courseTitle: req.body.courseTitle,
    courseNo: req.body.courseNo,
    batch: batch._id,
    department: batch.department,
  });

  await course.save();
  course = await course.getPopulatedData();
  return res.status(201).send(course);
});

router.put("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.batchId) {
    const batch = await Batch.findById(req.params.batchId);
    if (!batch) return res.status(400).send("Invalid batch Id");
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let course = await Course.findById(req.params.id);
  if (!course) return res.status(404).send("No course is found of this id");

  const courseIsExist = await Course.find({
    courseTitle: req.body.courseTitle,
    batch: course.batch,
  });
  if (courseIsExist[0])
    return res.status(400).send("A course is exist with this name");

  // course = await Course.findByIdAndUpdate(
  //   req.params.id,
  //   {
  //     $set: {
  //       courseTitle: req.body.courseTitle,
  //       courseNo: req.body.courseNo,
  //     },
  //   },
  //   { new: true, runValidators: true }
  // );

  course.courseTitle = req.body.courseTitle;
  course.courseNo = req.body.courseNo;
  await course.save();

  course = await course.getPopulatedData();
  return res.send(course);
});

router.delete("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.batchId) {
    const batch = await Batch.findById(req.params.batchId);
    if (!batch) return res.status(400).send("Invalid batch Id");
  }

  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).send("No course found of this id");

  await course.remove();
  return res.send(course);
});

router.get("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.batchId) {
    const batch = await Batch.findById(req.params.batchId);
    if (!batch) return res.status(400).send("Invalid batch Id");
  }

  const course = await Course.findById(req.params.id).populate([
    {
      path: "notes",
      select: "_id name -course",
    },
    { path: "questions", select: "_id name -course" },
  ]);
  if (!course) return res.status(404).send("No course found of this id");

  res.status(200).send(course);
});

module.exports = router;
