const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Group = require("../models/groupModel");
const Subscription = require("../models/subscriptionModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllGroup = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.name) {
    filter.name = req.query.name;
  }

  if (req.query.coach) {
    filter.createdBy = new ObjectId(req.query.coach);
  }

  let query = Group.find(filter)
    .sort("-createdAt")
    .populate("groupCategoryId", "name");

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const groups = await query;
  const totalCount = await Group.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: groups.length,
    data: {
      groups,
    },
  });
});

exports.getGroup = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id)
    .populate("members", "name email phone profilePic UDID")
    .populate("groupCategoryId", "name");

  if (!group) return next(new AppError("No Group found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: {
      group,
    },
  });
});

exports.createGroup = catchAsync(async (req, res, next) => {
  const { groupCategoryId } = req.body;
  if (!groupCategoryId)
    return next(new AppError("Please provide Group Category Id", 400));

  let group = await Group.findOne({ groupCategoryId, createdBy: req.user._id });
  if (group)
    return next(new AppError("Group already exists with this category", 400));

  req.body.members = [new Object(req.user._id)];
  req.body.createdBy = new Object(req.user._id);
  group = await Group.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Group created successfully",
    data: {
      group,
    },
  });
});

exports.deleteGroup = catchAsync(async (req, res, next) => {
  const group = await Group.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user.id,
  });

  if (!group) return next(new AppError("No Group found with that ID", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.joinGroup = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;

  const subscription = await Subscription.findOne({
    userId: req.user._id,
    validTill: { $gt: Date.now() },
  }).lean();

  if (!subscription)
    return next(
      new AppError(
        "There is no subscription plan active, please subscribe.",
        400
      )
    );

  let group = await Group.findOne({ _id: groupId, members: req.user._id });
  if (group)
    return next(new AppError("You have already joined this group", 400));

  group = await Group.findOne({ _id: groupId });

  let members = [...group.members, req.user._id];
  await Group.findByIdAndUpdate(
    groupId,
    { $set: { members } },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Group joined successfully",
  });
});
