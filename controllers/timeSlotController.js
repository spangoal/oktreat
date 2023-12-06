const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const TimeSlot = require("../models/timeSlotModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllTimeSlot = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.search) {
    filter.search = {
      $regex: req.query.search,
      $options: "i",
    };
  }

  let query = TimeSlot.find(filter);

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const timeSlots = await query;
  const totalCount = await TimeSlot.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: timeSlots.length,
    data: {
      timeSlots,
    },
  });
});

exports.createTimeSlot = catchAsync(async (req, res, next) => {
  const { date, startTime, endTime } = req.body;
  req.body.coachID = req.params.coachID;

  if (!date || !startTime || !endTime)
    return next(
      new AppError("Please provide Date, Start Time and End Time", 400)
    );

  const formatedStartTime = new Date(`${date}T${startTime}`);
  const formatedEndTime = new Date(`${date}T${endTime}`);

  let timeSlot = await TimeSlot.findOne({
    date,
    startTime: formatedStartTime,
    endTime: formatedEndTime,
    coachID: req.params.coachID,
  });

  req.body.startTime = formatedStartTime;
  req.body.endTime = formatedEndTime;

  if (timeSlot) return next(new AppError("Time Slot already exists", 400));

  timeSlot = await TimeSlot.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Time Slot created successfully",
    data: {
      timeSlot: timeSlot,
    },
  });
});

exports.updateTimeSlot = catchAsync(async (req, res, next) => {
  const { date, startTime, endTime } = req.body;

  let timeSlot = await TimeSlot.findOne({
    _id: { $ne: req.params.id },
    date,
    startTime,
    endTime,
    coachID: req.params.coachID,
  });

  if (timeSlot) return next(new AppError("Time Slot already exists", 400));

  timeSlot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!timeSlot)
    return next(new AppError("No Time Slot found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Time Slot updated successfully",
    data: { timeSlot },
  });
});

exports.deleteTimeSlot = catchAsync(async (req, res, next) => {
  const timeSlot = await TimeSlot.findOneAndDelete({
    _id: req.params.id,
    coachID: req.params.coachID,
  });

  if (!timeSlot)
    return next(new AppError("No Time Slot found with that ID", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
