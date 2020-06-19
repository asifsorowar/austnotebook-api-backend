const paramsIdCheck = require("../middleware/paramsIdCheck");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const { validate, Note } = require("../models/note");
const { Course } = require("../models/course");

const express = require("express");
const router = express.Router({ mergeParams: true });

router.get("/", [auth, paramsIdCheck], async (req, res) => {
  let notes;
  if (req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(400).send("Invalid course Id");

    notes = await Note.find({ course: course._id })
      .populate([
        { path: "course", select: "_id courseTitle courseNo " },
        { path: "batch", select: "_id name" },
        "department",
        { path: "user", select: "_id firstName lastName varsityId" },
      ])
      .sort("-semester");
  } else {
    notes = await Note.find()
      .populate([
        { path: "course", select: "_id courseTitle courseNo " },
        { path: "batch", select: "_id name" },
        "department",
        { path: "user", select: "_id firstName lastName varsityId" },
      ])
      .sort("-semester");
  }

  return res.send({ count: notes.length, data: notes });
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

  const noteIsExist = await Note.findOne({
    name: req.body.name,
    course: course._id,
  });
  if (noteIsExist) return res.status(400).send("A note has the same name");

  let note = new Note({
    name: req.body.name,
    semester: req.body.semester,
    url: req.body.url,
    course: course._id,
    batch: course.batch,
    department: course.department,
    user: req.user._id,
  });

  await note.save();
  note = await note.getPopulatedData();
  res.status(201).send(note);
});

router.put("/:id", [auth, paramsIdCheck], async (req, res) => {
  if (req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(400).send("Invalid course Id");
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let note = await Note.findById(req.params.id);
  if (!note) return res.status(404).send("No note is found of this id");

  if (!req.user.isAdmin) {
    if (req.user._id.toString() !== note.user.toString())
      return res.status(401).send("access denied");
  }

  const courseObject = await Course.findById(note.course);

  const noteIsExist = await Note.findOne({
    name: req.body.name,
    course: courseObject._id,
  });
  if (noteIsExist) return res.status(400).send("A note has the same name");

  note = await Note.findByIdAndUpdate(
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

  note = await note.getPopulatedData();
  return res.send(note);
});

router.delete("/:id", [auth, paramsIdCheck], async (req, res) => {
  if (req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(400).send("Invalid course Id");
  }

  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).send("No note found of this id");

  await note.remove();
  res.send(note);
});

router.get("/:id", [auth, paramsIdCheck], async (req, res) => {
  if (req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(400).send("Invalid course Id");
  }

  const note = await Note.findById(req.params.id).populate([
    { path: "course", select: "_id courseTitle courseNo " },
    { path: "batch", select: "_id name" },
    "department",
    { path: "user", select: "_id firstName lastName varsityId" },
  ]);
  if (!note) return res.status(404).send("No note found of this id");

  return res.status(200).send(note);
});

module.exports = router;
