const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const User = require("./../models/userModel");
const Notification = require("./../models/notificationModel");
const catchAsync = require("./../utils/catchAsync");
const sendNotification = require("./../utils/notification");

const sendNotificationUser = async (
  title,
  description,
  user,
  notificationType
) => {
  const newUser = await User.findById(user);

  await Notification.create({
    title,
    description,
    user,
    notificationType,
  });

  const options = {
    registrationToken: newUser.deviceToken,
    title,
    description,
  };

  try {
    if (newUser.deviceToken) await sendNotification(options);
    return {
      status: "success",
      message: "Notification sent successfully",
    };
  } catch (err) {
    console.log(err);
  }
};
exports.sendNotificationUser = sendNotificationUser;

exports.userNotification = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("No User found with that ID", 409));

  try {
    const result = await sendNotificationUser(
      req.body.title,
      req.body.description,
      req.params.id
    );
    res.status(201).json(result);
  } catch (err) {
    return next(
      new AppError(
        "There was an error sending the Notification. Please try again later.",
        500
      )
    );
  }
});

exports.getAllNotification = catchAsync(async (req, res, next) => {
  const filter = { user: req.user.id };
  let query = Notification.find(filter).sort("-createdAt");

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const notifications = await query;
  const total = await Notification.countDocuments(filter);

  // const readCount = notifications.filter((d) => d.isRead).length;
  // const unreadCount = notifications.length - readCount;

  res.status(200).json({
    status: "success",
    total: total,
    results: notifications.length,
    // readCount: readCount,
    // unreadCount: unreadCount,
    data: {
      notifications,
    },
  });
});

exports.markReadAllNotification = catchAsync(async (req, res, next) => {
  await Notification.updateMany({ user: req.user.id, isRead: true });

  res.status(200).json({
    status: "success",
    message: "Notifications updated successfully",
  });
});

exports.markReadNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true,
  });

  if (!notification)
    return next(new AppError("No notification found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Notification updated successfully",
  });
});
