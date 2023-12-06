const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Appointment = require("../models/appointmentModel");
const Subscription = require("../models/subscriptionModel");
const TimeSlot = require("../models/timeSlotModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;
const { sendNotificationUser } = require("./notificationController");

exports.getAllAppointment = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.user.role === "coach") {
    filter.coachId = new ObjectId(req.user._id);
  }

  if (req.user.role === "user") {
    filter.customerId = new ObjectId(req.user._id);
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  let query = [
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "timeslots",
        localField: "timeSlotId",
        foreignField: "_id",
        as: "timeSlotId",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "coachId",
        foreignField: "_id",
        as: "coachId",
      },
    },
    { $unwind: { path: "$timeSlotId", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$coachId", preserveNullAndEmptyArrays: true } },
  ];

  if (req.query.type) {
    query.push({ $match: { "timeSlotId.appointmentType": req.query.type } });
  }

  query.push({ $count: "count" });
  const totalCount = await Appointment.aggregate(query);
  query.pop();

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query.push({ $skip: skip });
    query.push({ $limit: limit });
  }

  const appointments = await Appointment.aggregate(query);

  res.status(200).json({
    status: "success",
    total: totalCount && totalCount.length ? totalCount[0].count : 0,
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

exports.getAllAppointmentCoach = catchAsync(async (req, res, next) => {
  const filter = {};

  filter.coachId = req.params.coachID;

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const query = Appointment.find(filter)
    .sort("-createdAt")
    .populate("customerId", "name email phone profilePic UDID")
    .populate("timeSlotId", "date startTime endTime appointmentType");

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const appointments = await query;
  const totalCount = await Appointment.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

exports.createAppointment = catchAsync(async (req, res, next) => {
  const { customerId, timeSlotId } = req.body;
  let coachId = req.params.coachID;

  const subscription = await Subscription.findOne({
    userId: req.user._id,
    validTill: { $gt: Date.now() },
  })
    .select("userId validTill")
    .populate("subscriptionPlanId", "name icon appointmentFeatures")
    .lean();

  if (!subscription)
    return next(
      new AppError(
        "There is no subscription plan active, please subscribe.",
        400
      )
    );

  const timeSlot = await TimeSlot.findOne({ _id: timeSlotId }).lean();

  if (
    !subscription.subscriptionPlanId.appointmentFeatures.includes(
      timeSlot.appointmentType
    )
  )
    return next(new AppError("Please upgrade your plan", 400));

  let appointment = await Appointment.findOne({
    coachId,
    timeSlotId,
    status: { $in: ["pending", "confirmed"] },
  });

  if (appointment) return next(new AppError("Time Slot already booked", 400));

  appointment = await Appointment.create({ customerId, coachId, timeSlotId });
  await TimeSlot.findByIdAndUpdate(timeSlotId, { isBooked: true });

  res.status(201).json({
    status: "success",
    message: "Appointment created successfully",
    data: {
      appointment,
    },
  });
});

exports.updateAppointment = catchAsync(async (req, res, next) => {
  const status = req.body.status;
  let appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!appointment)
    return next(new AppError("No Appointment found with that ID", 404));

  let isBooked = status === "cancelled" ? false : true;
  await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, { isBooked });

  if (status === "confirmed" || status === "cancelled")
    await sendNotificationUser(
      `Appointment ${status}`,
      `Your Appointment has been ${status}`,
      appointment.customerId,
      "appointment_status"
    );

  res.status(200).json({
    status: "success",
    message: "Appointment updated successfully",
    data: { appointment },
  });
});

exports.deleteAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findOneAndDelete({
    _id: req.params.id,
    coachId: req.params.coachID,
  });

  if (!appointment)
    return next(new AppError("No Appointment found with that ID", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
