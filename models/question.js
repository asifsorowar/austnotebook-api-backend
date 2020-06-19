const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  semester: {
    type: String,
    required: true,
    uppercase: true,
  },
  url: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: [true, "course is required"],
  },
  batch: {
    type: mongoose.Schema.ObjectId,
    ref: "Batch",
    required: [true, "batch is required"],
  },
  department: {
    type: mongoose.Schema.ObjectId,
    ref: "Department",
    required: [true, "department is required"],
  },
  datePublished: {
    type: Date,
    default: Date.now,
  },
  lastEdited: Date,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

questionSchema.methods.getPopulatedData = function () {
  return this.model("Question")
    .findById(this._id)
    .populate([
      { path: "course", select: "_id courseTitle courseNo " },
      { path: "batch", select: "_id name" },
      "department",
      { path: "user", select: "_id firstName lastName varsityId" },
    ]);
};

const Question = mongoose.model("Question", questionSchema);

const validate = (question) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    semester: Joi.string()
      .required()
      .regex(/^(spring|fall)(-)(20)(\d\d)$/i)
      .message(
        'Invalid "semester" format. Format have to "spring-xxxx" or "fall-xxxx"'
      ),
    url: Joi.string().required(),

    courseId: Joi.objectId(),
  });

  return schema.validate(question);
};

module.exports.validate = validate;
module.exports.Question = Question;
module.exports.questionSchema = questionSchema;
