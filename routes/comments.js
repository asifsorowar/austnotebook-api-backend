const { validate, Comment } = require("../models/comment");
const { Course } = require("../models/course");

const auth = require("../middleware/auth");
const paramsIdCheck = require("../middleware/paramsIdCheck");

const express = require("express");
const router = express.Router({ mergeParams: true });

router.get("/", [auth, paramsIdCheck], async (req, res) => {
  let course;
  if (req.params.courseId) {
    course = await Course.findById(req.params.courseId);
  } else {
    course = await Course.findById(req.query.courseId);
  }
  if (!course) return res.status(400).send("Invalid course id");

  const query = {
    course: course._id,
  };

  let path;
  if (req.query.path) {
    path = ["notes", "questions"].find((p) => p === req.query.path);
  }
  if (path) query["path"] = path;

  const comments = await Comment.find(query)
    .populate([
      "course",
      { path: "user", select: "firstName lastName varsityId photo" },
    ])
    .sort("-date");
  return res.status(200).send({ count: comments.length, data: comments });
});

// router.get("/:courseId/:path", async (req, res) => {
//   const course = await Course.findById(req.params.courseId);
//   if (!course) return res.status(400).send("Invalid course id");

//   const path = ["notes", "questions"].find((p) => p === req.params.path);
//   if (!path) return res.status(400).send("path must be notes or questions");

//   const comments = await Comment.find({ course: course._id, path: path }).sort(
//     "-date"
//   );
//   return res.status(200).send({ count: comments.length, data: comments });
// });

router.post("/", [auth, paramsIdCheck], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const course = await Course.findById(
    req.params.courseId || req.body.courseId
  );
  if (!course) return res.status(400).send("Invalid course id");

  let comment = new Comment({
    comment: req.body.comment,
    path: req.body.path,
    course: course._id,
    user: req.user._id,
  });

  await comment.save();
  comment = await comment.getPopulatedData();

  return res.status(200).send(comment);
});

router.delete("/:id", [auth, paramsIdCheck], async (req, res) => {
  const comment = await Comment.findByIdAndRemove(req.params.id);
  if (!comment) return res.status(404).send("No comment found of this id");

  res.status(200).send(comment);
});

module.exports = router;
