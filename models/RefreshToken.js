const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const RefreshTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  refresh: {
    type: String,
    require: true,
  },
});

module.exports = RefreshToken = mongoose.model(
  "RefreshToken",
  RefreshTokenSchema
);
