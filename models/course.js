const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    courseNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },
    batch: {
      type: mongoose.Schema.ObjectId,
      ref: "Batch",
      required: true,
    },
    department: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

courseSchema.methods.getPopulatedData = function () {
  return this.model("Course")
    .findById(this._id)
    .populate([{ path: "batch" }, "department"]);
};

courseSchema.pre("remove", async function (next) {
  await mongoose.model("Note").deleteMany({ course: this._id });
  await this.model("Question").deleteMany({ course: this._id });
  await this.model("Comment").deleteMany({ course: this._id });
  return next();
});

courseSchema.virtual("notes", {
  ref: "Note",
  localField: "_id",
  foreignField: "course",
  justOne: false,
});

courseSchema.virtual("questions", {
  ref: "Question",
  localField: "_id",
  foreignField: "course",
  justOne: false,
});

const Course = mongoose.model("Course", courseSchema);

const validate = (course) => {
  const schema = Joi.object({
    courseTitle: Joi.string().required(),
    courseNo: Joi.string().required(),
    batchId: Joi.objectId(),
  });

  return schema.validate(course);
};

module.exports.validate = validate;
module.exports.Course = Course;
