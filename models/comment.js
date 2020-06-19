const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
    enum: ["notes", "questions"],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

commentSchema.methods.getPopulatedData = function () {
  return this.model("Comment")
    .findById(this._id)
    .populate([
      "course",
      { path: "user", select: "firstName lastName varsityId" },
    ]);
};

const Comment = mongoose.model("Comment", commentSchema);

const validateComment = (comment) => {
  const schema = Joi.object({
    comment: Joi.string().required().min(3),
    path: Joi.string().required(),
    courseId: Joi.objectId(),
  });

  return schema.validate(comment);
};

module.exports.validate = validateComment;
module.exports.Comment = Comment;
