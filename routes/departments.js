const { validate, Department } = require("../models/department");
const paramsIdCheck = require("../middleware/paramsIdCheck");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");

const express = require("express");
const router = express.Router();

//Batch Router assigned
const batchRoute = require("./batches");
router.use("/:deptId/batches", batchRoute);

router.get("/", async (req, res) => {
  const departments = await Department.find().sort("name");
  return res.send({ count: departments.length, data: departments });
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const departmentIsExist = await Department.findOne({
    name: req.body.name,
  });
  if (departmentIsExist)
    return res.status(400).send("A department is existed with the same name.");

  const department = new Department({
    name: req.body.name,
  });

  await department.save();
  return res.status(201).send(department);
});

router.put("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  console.log(req.body);

  const department = await Department.findById(req.params.id);
  if (!department)
    return res.status(404).send("Department of this Id is not found");

  const departmentIsExist = await Department.findOne({
    name: req.body.name,
  });
  if (departmentIsExist)
    return res.status(400).send("A department is existed with the same name.");

  // department = await Department.findByIdAndUpdate(
  //   req.params.id,
  //   {
  //     $set: {
  //       name: req.body.name,
  //     },
  //   },
  //   { new: true, runValidators: true }
  // );
  department.name = req.body.name;
  await department.save();

  return res.send(department);
});

router.delete("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department)
    return res
      .status(404)
      .send("The department with the given ID was not found.");

  await department.remove();

  return res.send(department);
});

router.get("/:id", [auth, admin, paramsIdCheck], async (req, res) => {
  const department = await Department.findById(req.params.id).populate([
    { path: "batches", select: "_id name -department" },
    { path: "courses", select: "_id courseTitle courseNo -department" },
  ]);
  if (!department)
    return res
      .status(404)
      .send("The department with the given ID was not found.");

  return res.send(department);
});

module.exports = router;
