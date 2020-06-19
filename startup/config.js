require("colors");
require("express-async-errors");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

module.exports = () => {
  if (!process.env.JWT_key) {
    console.log("FATAL ERROR: JWT_KEY is not defined.".red.bold);
    process.exit(1);
  }
};
