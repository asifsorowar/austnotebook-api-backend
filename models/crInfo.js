const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const crInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  varsityId: {
    type: String,
    required: true,
    unique: true,
    minlength: 9,
    maxlength: 9,
  },
  phoneNumber: {
    type: String,
    minlength: 11,
    maxlength: 12,
    required: true,
  },
  batch: {
    type: mongoose.Schema.ObjectId,
    ref: "Batch",
    required: true,
  },
  lastEdited: Date,
});

crInfoSchema.methods.getPopulatedData = function () {
  return this.model("CrInfo").findById(this._id).populate("batch");
};

const CrInfo = mongoose.model("CrInfo", crInfoSchema);

const validate = (crInfo) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    section: Joi.string().required(),
    group: Joi.string().required(),
    phoneNumber: Joi.string()
      .required()
      .min(11)
      .max(12)
      .regex(/^[0-9]+$/)
      .message("Phone number must be number"),
    varsityId: Joi.string()
      .required()
      .min(9)
      .max(9)
      .regex(/^[0-9]+$/)
      .message("Invalid varsity id format"),
    batchId: Joi.objectId(),
  });

  return schema.validate(crInfo);
};

module.exports.CrInfo = CrInfo;
module.exports.validate = validate;
