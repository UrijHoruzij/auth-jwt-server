const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UploadSchema = new Schema({
  filename: {
    type: String,
  },
  size: { type: Number },
  ext: { type: String },
  url: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", require: true },
});

module.exports = Upload = mongoose.model("Upload", UploadSchema);
