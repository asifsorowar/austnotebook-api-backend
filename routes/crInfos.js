const { CrInfo, validate } = require("../models/crInfo");
const { Batch } = require("../models/batch");

const paramsIdCheck = require("../middleware/paramsIdCheck");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const express = require("express");
const router = express.Router({ mergeParams: true });

router.get("/", [auth, paramsIdCheck], async (req, res) => {
  let crInfos;

  if (req.params.batchId) {
    const batch = await Batch.findOne({ _id: req.params.batchId });
    if (!batch) return res.status(400).send("Invalid batch id");

    crInfos = await CrInfo.find({ batch: batch._id })
      .populate("batch")
      .sort("-section");
  } else {
    crInfos = await CrInfo.find({}).populate("batch").sort("-section");
  }

  return res.status(200).send({ count: crInfos.length, data: crInfos });
});

router.post("/", [auth, paramsIdCheck], async (req, res) => {
  let batch;
  if (req.params.batchId) {
    batch = await Batch.findOne({ _id: req.params.batchId });
  } else {
    batch = await Batch.findById(req.body.batchId);
  }
  if (!batch) return res.status(400).send("Invalid batch id");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let crInfo = await new CrInfo({
    name: req.body.name,
    section: req.body.section,
    group: req.body.group,
    varsityId: req.body.varsityId,
    phoneNumber: req.body.phoneNumber,
    batch: batch._id,
  });

  await crInfo.save();

  crInfo = await crInfo.getPopulatedData();
  res.status(200).send(crInfo);
});

router.put("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  let batch;
  if (req.params.batchId) {
    batch = await Batch.findOne({ _id: req.params.batchId });
    if (!batch) return res.status(400).send("Invalid batch id");
  } else {
    batch = await Batch.findById(req.body.batchId);
    if (!batch) return res.status(400).send("Invalid batch id");
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let crInfo = await CrInfo.findById(req.params.id);
  if (!crInfo) return res.status(400).send("Invalid crInfo id");

  crInfo = await CrInfo.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        section: req.body.section,
        group: req.body.group,
        phoneNumber: req.body.phoneNumber,
        batch: batch._id,
      },
      $currentDate: {
        lastEdited: true,
      },
    },
    { new: true, runValidators: true }
  );

  crInfo = await crInfo.getPopulatedData();
  return res.status(201).send(crInfo);
});

router.delete("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.batchId) {
    const batch = await Batch.findOne({ _id: req.params.batchId });
    if (!batch) return res.status(400).send("Invalid batch id");
  }

  const crInfo = await CrInfo.findByIdAndDelete(req.params.id);
  if (!crInfo) return res.status(404).send("No crInfo found of this id");
  return res.status(200).send(crInfo);
});

router.get("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.batchId) {
    const batch = await Batch.findOne({ _id: req.params.batchId });
    if (!batch) return res.status(400).send("Invalid batch id");
  }

  const crInfo = await CrInfo.findById(req.params.id).populate("batch");
  if (!crInfo) return res.status(404).send("No crInfo found of this id");

  return res.status(200).send(crInfo);
});

module.exports = router;
