const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const teacherInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  courseTitle: {
    type: String,
    required: true,
  },
  courseNo: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    minlength: 11,
    maxlength: 12,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  batch: {
    type: mongoose.Schema.ObjectId,
    ref: "Batch",
    required: true,
  },
  lastEdited: Date,
});

teacherInfoSchema.methods.getPopulatedData = function () {
  return this.model("TeacherInfo").findById(this._id).populate("batch");
};

const TeacherInfo = mongoose.model("TeacherInfo", teacherInfoSchema);

const validate = (teacherInfo) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    courseTitle: Joi.string().required(),
    courseNo: Joi.string().required(),
    phoneNumber: Joi.string()
      .required()
      .min(11)
      .max(12)
      .regex(/^[0-9]+$/)
      .message("Phone number must be number"),
    email: Joi.string().email().required(),
    batchId: Joi.objectId(),
  });

  return schema.validate(teacherInfo);
};

module.exports.TeacherInfo = TeacherInfo;
module.exports.validate = validate;
