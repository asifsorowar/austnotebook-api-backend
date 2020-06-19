const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

departmentSchema.pre("remove", async function (next) {
  await this.model("Batch").deleteMany({ department: this._id });
  await this.model("Course").deleteMany({ department: this._id });
  await this.model("Note").deleteMany({ department: this._id });
  await this.model("Question").deleteMany({ department: this._id });
  // await this.model("TeacherInfo").deleteMany({ department: this._id });
  // await this.model("CrInfo").deleteMany({ department: this._id });
  return next();
});

departmentSchema.virtual("batches", {
  ref: "Batch",
  localField: "_id",
  foreignField: "department",
  justOne: false,
});

departmentSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "department",
  justOne: false,
});

const Department = mongoose.model("Department", departmentSchema);

const validateDepartment = (department) => {
  const schema = Joi.object({
    name: Joi.string().required(),
  });

  return schema.validate(department);
};

module.exports.validate = validateDepartment;
module.exports.Department = Department;
