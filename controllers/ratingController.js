const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Rating = require("../models/ratingModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllRating = catchAsync(async (req, res, next) => {
  const filter = {};
  filter.userId = req.user._id;

  let query = Rating.find(filter)
    .sort("-createdAt")
    .populate("addedBy", "name profilePic");

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const ratings = await query;
  const totalCount = await Rating.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: ratings.length,
    data: {
      ratings,
    },
  });
});

exports.createRating = catchAsync(async (req, res, next) => {
  const { appointmentId, userId, rating, comment } = req.body;

  if (!appointmentId || !userId || !rating)
    return next(
      new AppError("Please provide appointment ID,  user ID and rating", 400)
    );

  const existingRating = await Rating.findOne({
    appointmentId,
    addedBy: req.user._id,
  });

  if (existingRating)
    return next(new AppError("You have already rated this appointment", 400));

  const newRating = await Rating.create({
    appointmentId,
    userId,
    addedBy: req.user._id,
    rating,
    comment,
  });

  res.status(201).json({
    status: "success",
    message: "Appointment created successfully",
    data: {
      rating: newRating,
    },
  });
});

exports.updateRating = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;
  let updatedRating = await Rating.findByIdAndUpdate(
    req.params.id,
    {
      rating,
      comment,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedRating)
    return next(new AppError("No Rating found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Rating updated successfully",
    data: { rating: updatedRating },
  });
});

exports.deleteRating = catchAsync(async (req, res, next) => {
  const rating = await Rating.findOneAndDelete({
    _id: req.params.id,
    addedBy: req.user._id,
  });

  if (!rating) return next(new AppError("No Rating found with that ID", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
