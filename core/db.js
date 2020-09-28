const mongoose = require("mongoose");
require("dotenv").config();

const db = {};
db.connect = async () => {
  const connect = await mongoose.connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  if (connect) {
    console.log("Connected Successfully to MongoDB");
  } else {
    console.error("Ошибка поключения к базе данных");
  }
};

module.exports = db;
