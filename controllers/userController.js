const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllUser = catchAsync(async (req, res, next) => {
  const filter = { role: "user", isDeleted: { $ne : true } };

  if (req.query.search) {
    filter.name = {
      $regex: req.query.search,
      $options: "i",
    };
  }

  let query = User.find(filter)
    .sort("-createdAt")
    .select("name email phone profilePic coachCategory coachRating");

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const users = await query;
  const totalCount = await User.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("+coachRating");

  if (!user) return next(new AppError("No user found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
