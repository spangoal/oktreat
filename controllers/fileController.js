const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { upload, remove } = require("../utils/spaces");

exports.uploadFile = catchAsync(async (req, res, next) => {
  const file =
    req.files && req.files.file && req.files.file.length
      ? req.files.file[0]
      : {};
  const folder = req.body.folder ? req.body.folder : "";

  if (!file.fieldname || !folder)
    return next(new AppError("Please Provide File and Folder", 400));

  const mimetype = file.mimetype;
  let fileName = `${
    file.originalname.split(".")[0]
  }-${uuidv4()}-${Date.now()}.${mimetype.split("/")[1]}`;

  fileName.replace(/\s/g, "")

  const key = await upload(file.buffer, fileName, folder, mimetype);
  res.status(200).json({
    status: "success",
    message: "File uploaded successfully",
    data: { file: key },
  });
});

exports.deleteFile = catchAsync(async (req, res, next) => {
  await remove(req.body.file);

  res.status(200).json({
    status: "success",
    message: "File deleted successfully",
  });
});
