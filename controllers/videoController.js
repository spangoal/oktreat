const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Video = require("../models/videoModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllVideo = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.search) {
    filter.title = {
      $regex: req.query.search,
      $options: "i",
    };
  }

  let query = Video.find(filter).sort("-createdAt");

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const videos = await query;
  const totalCount = await Video.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: videos.length,
    data: {
      videos,
    },
  });
});

exports.createVideo = catchAsync(async (req, res, next) => {
  const { title, link, description } = req.body;

  if (!title || !link)
    return next(new AppError("Please Video title and link", 400));

  const newVideo = await Video.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Video created successfully",
    data: {
      video: newVideo,
    },
  });
});

exports.updateVideo = catchAsync(async (req, res, next) => {
  let updatedVideo = await Video.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedVideo)
    return next(new AppError("No Video found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Video updated successfully",
    data: { video: updatedVideo },
  });
});

exports.deleteVideo = catchAsync(async (req, res, next) => {
  const video = await Video.findOneAndDelete({
    _id: req.params.id,
  });

  if (!video) return next(new AppError("No Video found with that ID", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
