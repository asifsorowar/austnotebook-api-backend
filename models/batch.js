const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

batchSchema.methods.getPopulatedData = function () {
  return this.model("Batch").findById(this._id).populate("department");
};

batchSchema.pre("remove", async function (next) {
  await this.model("Course").deleteMany({ batch: this._id });
  await this.model("CrInfo").deleteMany({ batch: this._id });
  await this.model("TeacherInfo").deleteMany({ batch: this._id });
  return next();
});

batchSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "batch",
  justOne: false,
});

batchSchema.virtual("crInfos", {
  ref: "CrInfo",
  localField: "_id",
  foreignField: "batch",
  justOne: false,
});

const Batch = mongoose.model("Batch", batchSchema);

const validateBatch = (batch) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    departmentId: Joi.objectId(),
  });

  return schema.validate(batch);
};

module.exports.Batch = Batch;
module.exports.validate = validateBatch;
