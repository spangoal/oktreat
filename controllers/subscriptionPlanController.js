const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const SubscriptionPlan = require("../models/subscriptionPlanModel");
const TimeSlot = require("../models/timeSlotModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllSubscriptionPlan = catchAsync(async (req, res, next) => {
  let query = SubscriptionPlan.find().sort("createdAt");

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const subscriptionPlans = await query;
  const totalCount = await SubscriptionPlan.countDocuments();

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: subscriptionPlans.length,
    data: {
      subscriptionPlans: subscriptionPlans,
    },
  });
});

exports.createSubscriptionPlan = catchAsync(async (req, res, next) => {
  const { name, icon, price, validity } = req.body;

  if (!name || !price || !validity)
    return next(new AppError("Please provide Name, Price and Validity", 400));

  let subscriptionPlan = await SubscriptionPlan.findOne({ name });

  if (subscriptionPlan)
    return next(
      new AppError(`Subscription Plan with ${name} already exists`, 400)
    );

  subscriptionPlan = await SubscriptionPlan.create({
    name,
    icon,
    price,
    validity,
    appointmentFeatures,
  });

  res.status(201).json({
    status: "success",
    message: "Subscription Plan created successfully",
    data: {
      subscriptionPlan,
    },
  });
});

exports.updateSubscriptionPlan = catchAsync(async (req, res, next) => {
  let subscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!subscriptionPlan)
    return next(new AppError("No Subscription Plan found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Subscription Plan updated successfully",
    data: { subscriptionPlan },
  });
});

exports.deleteSubscriptionPlan = catchAsync(async (req, res, next) => {
  const subscriptionPlan = await SubscriptionPlan.findOneAndDelete({
    _id: req.params.id,
  });

  if (!subscriptionPlan)
    return next(new AppError("No Subscription Plan found with that ID", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
