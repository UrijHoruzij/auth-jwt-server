const mongoose = require("mongoose");
require("dotenv").config();

const db = {};
db.connect = () => {
  mongoose
    .connect(process.env.DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => console.log("Connected Successfully to MongoDB"))
    .catch((err) => console.error(err));
};

module.exports = db;
