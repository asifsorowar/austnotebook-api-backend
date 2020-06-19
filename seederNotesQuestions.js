const { Note } = require("./models/note");
const { Question } = require("./models/question");
const { Course } = require("./models/course");
const { User } = require("./models/user");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const data1 = [
  {
    name: "demo-notes-1",
    semester: "demo-notes-No 1",
  },
  {
    name: "demo-notes-2",
    semester: "demo-notes-No 2",
  },
  {
    name: "demo-notes-3",
    semester: "demo-notes-No 3",
  },
  {
    name: "demo-notes-4",
    semester: "demo-notes-No 4",
  },
  {
    name: "demo-notes-5",
    semester: "demo-notes-No 5",
  },
  {
    name: "demo-notes-6",
    semester: "demo-notes-No 6",
  },
  {
    name: "demo-notes-7",
    semester: "demo-notes-No 7",
  },
  {
    name: "demo-notes-8",
    semester: "demo-notes-No 8",
  },
];

const data2 = [
  {
    name: "demo-questions-1",
    semester: "demo-questions-No 1",
  },
  {
    name: "demo-questions-2",
    semester: "demo-questions-No 2",
  },
  {
    name: "demo-questions-3",
    semester: "demo-questions-No 3",
  },
  {
    name: "demo-questions-4",
    semester: "demo-questions-No 4",
  },
  {
    name: "demo-questions-5",
    semester: "demo-questions-No 5",
  },
  {
    name: "demo-questions-6",
    semester: "demo-questions-No 6",
  },
  {
    name: "demo-questions-7",
    semester: "demo-questions-No 7",
  },
  {
    name: "demo-questions-8",
    semester: "demo-questions-No 8",
  },
];

async function notes_questionsSeeder() {
  await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  await Note.deleteMany();
  await Question.deleteMany();

  const course1 = await Course.findOne({ courseTitle: "demo-1" });
  const course2 = await Course.findOne({ courseTitle: "demo-2" });

  const notes1 = data1.map((note) => ({
    ...note,
    course: course1._id,
    batch: course1.batch,
    department: course1.department,
    user: course1._id,
  }));

  const questions1 = data2.map((question) => ({
    ...question,
    course: course1._id,
    batch: course1.batch,
    department: course1.department,
    user: course1._id,
  }));

  const notes2 = data1.map((note) => ({
    ...note,
    course: course2._id,
    batch: course2.batch,
    department: course2.department,
    user: course2._id,
  }));

  const questions2 = data2.map((question) => ({
    ...question,
    course: course2._id,
    batch: course2.batch,
    department: course2.department,
    user: course2._id,
  }));

  await Note.insertMany(notes1);
  await Note.insertMany(notes2);
  await Question.insertMany(questions1);
  await Question.insertMany(questions2);

  await mongoose.disconnect();

  console.log("done");
}

notes_questionsSeeder();
