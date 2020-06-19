const { TeacherInfo } = require("./models/teacherInfo");
const { Batch } = require("./models/batch");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const data = [
  {
    name: "demo-name - 1",
    courseTitle: "demo",
    courseNo: "demo-1",
    email: "sample@gmail.com",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 2",
    courseTitle: "demo",
    courseNo: "demo-1",
    email: "sample@gmail.com",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 3",
    courseTitle: "demo",
    courseNo: "demo-1",
    email: "sample@gmail.com",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 4",
    courseTitle: "demo",
    courseNo: "demo-1",
    email: "sample@gmail.com",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 5",
    courseTitle: "demo",
    courseNo: "demo-1",
    email: "sample@gmail.com",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 6",
    courseTitle: "demo",
    courseNo: "demo-1",
    email: "sample@gmail.com",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 7",
    courseTitle: "demo",
    courseNo: "demo-1",
    email: "sample@gmail.com",
    phoneNumber: "01766771609",
  },
];

async function seeder() {
  await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  await TeacherInfo.deleteMany();

  const batch = await Batch.findOne({ name: "cse-1.1" });

  const teacherInfos = data.map((teacher) => ({
    ...teacher,
    batch: batch._id,
  }));

  await TeacherInfo.insertMany(teacherInfos);

  await mongoose.disconnect();

  console.log("done");
}

seeder();
