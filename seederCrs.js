const { CrInfo } = require("./models/crInfo");
const { Batch } = require("./models/batch");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const data = [
  {
    name: "demo-name - 1",
    section: "b",
    group: "b-2",
    varsityId: "170104001",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 2",
    section: "b",
    group: "b-2",
    varsityId: "170104002",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 3",
    section: "b",
    group: "b-2",
    varsityId: "170104003",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 4",
    section: "b",
    group: "b-2",
    varsityId: "170104004",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 5",
    section: "b",
    group: "b-2",
    varsityId: "170104005",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 6",
    section: "b",
    group: "b-2",
    varsityId: "170104006",
    phoneNumber: "01766771609",
  },
  {
    name: "demo-name - 7",
    section: "b",
    group: "b-2",
    varsityId: "170104007",
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

  await CrInfo.deleteMany();

  const batch = await Batch.findOne({ name: "cse-1.1" });

  const crInfos = data.map((crInfo) => ({
    ...crInfo,
    batch: batch._id,
  }));

  await CrInfo.insertMany(crInfos);

  await mongoose.disconnect();

  console.log("done");
}

seeder();
