const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const GroupCategory = require("../models/groupCategoryModel");
const TimeSlot = require("../models/timeSlotModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllGroupCategory = catchAsync(async (req, res, next) => {
  const filter = {};

  filter.coachId = req.params.coachID;

  if (req.query.name) {
    filter.name = req.query.name;
  }

  let query = GroupCategory.find(filter);

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const groupCategories = await query;
  const totalCount = await GroupCategory.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: groupCategories.length,
    data: {
      groupCategories,
    },
  });
});

exports.createGroupCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name) return next(new AppError("Please provide name", 400));

  let groupCategory = await GroupCategory.findOne({ name });
  if (groupCategory)
    return next(new AppError("Group Category already exists", 400));

  groupCategory = await GroupCategory.create({ name });

  res.status(201).json({
    status: "success",
    message: "Group Category created successfully",
    data: {
      groupCategory,
    },
  });
});

exports.updateGroupCategory = catchAsync(async (req, res, next) => {
  let groupCategory = await GroupCategory.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!groupCategory)
    return next(new AppError("No Group Category found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Group Category updated successfully",
    data: { groupCategory },
  });
});

exports.deleteGroupCategory = catchAsync(async (req, res, next) => {
  const groupCategory = await GroupCategory.findOneAndDelete({
    _id: req.params.id,
  });

  if (!groupCategory)
    return next(new AppError("No Group Category found with that ID", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
