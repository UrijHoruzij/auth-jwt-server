const UploadModel = require("../models/Upload");
require("dotenv").config();
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
class upload {
  create = (req, res) => {
    const userId = req.query.id;
    const file = req.file;
    cloudinary.v2.uploader
      .upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error || !result) {
          return res.status(500).json({
            status: "error",
            message: error || "upload error",
          });
        }

        const fileData = {
          filename: result.original_filename,
          size: result.bytes,
          ext: result.format,
          url: result.url,
          user: userId,
        };

        const uploadFile = new UploadModel(fileData);

        uploadFile
          .save()
          .then((fileObj) => {
            res.json({
              status: "success",
              file: fileObj,
            });
          })
          .catch((err) => {
            res.json({
              status: "error",
              message: err,
            });
          });
      })
      .end(file.buffer);
  };

  delete = (req, res) => {
    const fileId = req.query.id;
    Upload.deleteOne({ _id: fileId }, function (err) {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: err,
        });
      }
      res.json({
        status: "success",
      });
    });
  };
}

module.exports = upload;
