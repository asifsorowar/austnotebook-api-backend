const { Course } = require("./models/course");
const { Batch } = require("./models/batch");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

// mongoose
//   .connect(process.env.MONGO_URI, {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//     useFindAndModify: false,
//     useCreateIndex: true,
//   })
//   .then(() => "conncetion ok")
//   .catch("Connection problem");

// let batch;
// async function findBatch() {
//   batch = await Batch.findOne({ name: "cse-1.1" });
// }
// findBatch();

const data = [
  {
    courseTitle: "demo-1",
    courseNo: "demo-No 1",
  },
  {
    courseTitle: "demo-2",
    courseNo: "demo-No 2",
  },
  {
    courseTitle: "demo-3",
    courseNo: "demo-No 3",
  },
  {
    courseTitle: "demo-4",
    courseNo: "demo-No 4",
  },
];

async function courseSeeded() {
  await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  await Course.deleteMany();

  const batch = await Batch.findOne({ name: "cse-1.1" });

  const courses = data.map((course) => ({
    ...course,
    batch: batch._id,
    department: batch.department,
  }));

  await Course.insertMany(courses);

  await mongoose.disconnect();

  console.log("done");
}

courseSeeded();
