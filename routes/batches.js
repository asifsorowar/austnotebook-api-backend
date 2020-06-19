const { validate, Batch } = require("../models/batch");
const { Department } = require("../models/department");
const paramsIdCheck = require("../middleware/paramsIdCheck");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const express = require("express");
const router = express.Router({ mergeParams: true });

//Course Router & crInfo Router assigned
const courseRouter = require("./courses");
router.use("/:batchId/courses", courseRouter);
const crInfoRouter = require("./crInfos");
router.use("/:batchId/crInfos", crInfoRouter);
const teacherInfoRouter = require("./teacherInfos");
router.use("/:batchId/teacherInfos", teacherInfoRouter);

// All batches
// /api/departments/:deptId/batches
router.get("/", [paramsIdCheck], async (req, res) => {
  let batches;

  if (req.params.deptId) {
    const department = await Department.findById(req.params.deptId);
    if (!department) return res.status(400).send("Invalid department id");

    batches = await Batch.find({ department: department._id })
      .populate("department")
      .sort("name");
  } else {
    batches = await Batch.find().populate("department").sort("name");
  }

  return res.send({ count: batches.length, data: batches });
});

// api/batches/
// api/departments/:deptId/batches
router.post("/", [auth, admin, paramsIdCheck], async (req, res) => {
  let department;
  if (req.params.deptId) {
    department = await Department.findById(req.params.deptId);
  } else {
    department = await Department.findById(req.body.departmentId);
  }
  if (!department) return res.status(400).send("Invalid department id");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const batchIsExist = await Batch.findOne({
    name: req.body.name,
    department: department._id,
  });
  if (batchIsExist)
    return res.status(400).send("A batch is existed with the name");

  let batch = new Batch({
    name: req.body.name,
    department: department._id,
  });

  await batch.save();

  batch = await batch.getPopulatedData();
  return res.status(201).send(batch);
});

router.put("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.deptId) {
    const department = await Department.findById(req.params.deptId);
    if (!department) return res.status(400).send("Invalid department id");
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let batch = await Batch.findById(req.params.id);
  if (!batch) return res.status(404).send("No batch found of this id");

  const batchIsExist = await Batch.find({
    name: req.body.name,
    department: batch.department,
  });
  if (batchIsExist[0])
    return res.status(400).send("A batch is existed with the name");

  batch = await Batch.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
      },
    },
    { new: true, runValidators: true }
  );

  batch = await batch.getPopulatedData();
  return res.send(batch);
});

router.delete("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.deptId) {
    const department = await Department.findById(req.params.deptId);
    if (!department) return res.status(404).send("Invalid department id");
  }

  const batch = await Batch.findById(req.params.id);
  if (!batch)
    return res.status(404).send("The batch with the given ID was not found.");

  await batch.remove();
  return res.send(batch);
});

router.get("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  if (req.params.deptId) {
    const department = await Department.findById(req.params.deptId);
    if (!department) return res.status(400).send("Invalid department id");
  }

  const batch = await Batch.findById(req.params.id).populate([
    "department",
    { path: "courses", select: "_id courseTitle courseNo -batch" },
    { path: "crInfos", select: "_id name varsityId phoneNumber -batch" },
  ]);
  if (!batch) return res.status(404).send("No batch found of this id");

  return res.status(200).send(batch);
});

module.exports = router;
