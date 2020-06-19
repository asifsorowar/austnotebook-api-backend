const { Department } = require("./models/department");
const { Batch } = require("./models/batch");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const data = [
  {
    department: "cse",
    batches: [
      { name: "cse-1.1" },
      { name: "cse-1.2" },
      { name: "cse-2.1" },
      { name: "cse-2.2" },
      { name: "cse-3.1" },
      { name: "cse-3.2" },
      { name: "cse-4.1" },
      { name: "cse-4.2" },
    ],
  },
  {
    department: "eee",
    batches: [
      { name: "eee-1.1" },
      { name: "eee-1.2" },
      { name: "eee-2.1" },
      { name: "eee-2.2" },
      { name: "eee-3.1" },
      { name: "eee-3.2" },
      { name: "eee-4.1" },
      { name: "eee-4.2" },
    ],
  },
  {
    department: "arc",
    batches: [
      { name: "arc-1.1" },
      { name: "arc-1.2" },
      { name: "arc-2.1" },
      { name: "arc-2.2" },
      { name: "arc-3.1" },
      { name: "arc-3.2" },
      { name: "arc-4.1" },
      { name: "arc-4.2" },
    ],
  },
  {
    department: "te",
    batches: [
      { name: "te-1.1" },
      { name: "te-1.2" },
      { name: "te-2.1" },
      { name: "te-2.2" },
      { name: "te-3.1" },
      { name: "te-3.2" },
      { name: "te-4.1" },
      { name: "te-4.2" },
    ],
  },
  {
    department: "ce",
    batches: [
      { name: "ce-1.1" },
      { name: "ce-1.2" },
      { name: "ce-2.1" },
      { name: "ce-2.2" },
      { name: "ce-3.1" },
      { name: "ce-3.2" },
      { name: "ce-4.1" },
      { name: "ce-4.2" },
    ],
  },
  {
    department: "ipe",
    batches: [
      { name: "ipe-1.1" },
      { name: "ipe-1.2" },
      { name: "ipe-2.1" },
      { name: "ipe-2.2" },
      { name: "ipe-3.1" },
      { name: "ipe-3.2" },
      { name: "ipe-4.1" },
      { name: "ipe-4.2" },
    ],
  },
  {
    department: "me",
    batches: [
      { name: "me-1.1" },
      { name: "me-1.2" },
      { name: "me-2.1" },
      { name: "me-2.2" },
      { name: "me-3.1" },
      { name: "me-3.2" },
      { name: "me-4.1" },
      { name: "me-4.2" },
    ],
  },
];

async function seeder() {
  await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  await Department.deleteMany();
  await Batch.deleteMany();

  for (let department of data) {
    const { _id: departmentId } = await new Department({
      name: department.department,
    }).save();

    const batches = department.batches.map((batch) => ({
      ...batch,
      department: departmentId,
    }));

    await Batch.insertMany(batches);
  }

  mongoose.disconnect();

  console.log("done");
}

seeder();
