const paramsIdCheck = require("../middleware/paramsIdCheck");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const { validate, Question } = require("../models/question");
const { Course } = require("../models/course");

const express = require("express");
const router = express.Router({ mergeParams: true });

router.get("/", [auth, paramsIdCheck], async (req, res) => {
  let questions;

  if (req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(400).send("Invalid course Id");

    questions = await Question.find({ course: course._id })
      .populate([
        { path: "course", select: "_id courseTitle courseNo " },
        { path: "batch", select: "_id name" },
        "department",
        { path: "user", select: "_id firstName lastName varsityId" },
      ])
      .sort("-semester");
  } else {
    questions = await Question.find()
      .populate([
        { path: "course", select: "_id courseTitle courseNo " },
        { path: "batch", select: "_id name" },
        "department",
        { path: "user", select: "_id firstName lastName varsityId" },
      ])
      .sort("-semester");
  }

  return res.send({ count: questions.length, data: questions });
});

router.post("/", [auth, paramsIdCheck], async (req, res) => {
  let course;
  if (req.params.courseId) {
    course = await Course.findById(req.params.courseId);
  } else {
    course = await Course.findById(req.body.courseId);
  }
  if (!course) return res.status(400).send("Invalid course Id");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const questionIsExist = await Question.findOne({
    name: req.body.name,
    course: course._id,
  });
  if (questionIsExist)
    return res.status(400).send("A question has the same name");

  let question = new Question({
    name: req.body.name,
    semester: req.body.semester,
    url: req.body.url,
    course: course._id,
    batch: course.batch,
    department: course.department,
    user: req.user._id,
  });

  await question.save();
  question = await question.getPopulatedData();
  res.status(201).send(question);
});

router.put("/:id", [auth, paramsIdCheck], async (req, res) => {
  if (req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(400).send("Invalid course Id");
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let question = await Question.findById(req.params.id);
  if (!question) return res.status(404).send("No question is found of this id");

  if (!req.user.isAdmin) {
    if (req.user._id.toString() !== question.user.toString())
      return res.status(401).send("access denied");
  }

  const courseObject = await Course.findById(question.course);

  const questionIsExist = await Question.findOne({
    name: req.body.name,
    course: courseObject._id,
  });
  if (questionIsExist)
    return res.status(400).send("A question has the same name");

  question = await Question.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        semester: req.body.semester,
        url: req.body.url,
      },
      $currentDate: {
        lastEdited: true,
      },
    },
    { new: true }
  );

  question = await question.getPopulatedData();
  return res.send(question);
});

router.delete("/:id", [auth, paramsIdCheck], async (req, res) => {
  if (req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(400).send("Invalid course Id");
  }

  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).send("No question found of this id");

  await question.remove();
  res.send(question);
});

router.get("/:id", [auth, paramsIdCheck], async (req, res) => {
  if (req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(400).send("Invalid course Id");
  }

  const question = await Question.findById(req.params.id).populate([
    { path: "course", select: "_id courseTitle courseNo " },
    { path: "batch", select: "_id name" },
    "department",
    { path: "user", select: "_id firstName lastName varsityId" },
  ]);
  if (!question) return res.status(404).send("No course found of this id");

  return res.status(200).send(question);
});

module.exports = router;
