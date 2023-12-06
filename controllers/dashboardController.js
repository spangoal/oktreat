const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;

exports.getDataCount = catchAsync(async (req, res, next) => {
  const userCount = await User.countDocuments({ role: "user" });
  const coachCount = await User.countDocuments({ role: "coach" });
  const orderCount = await Order.countDocuments();
  const productCount = await Product.countDocuments();

  res.status(200).json({
    status: "success",
    data: {
      userCount,
      coachCount,
      orderCount,
      productCount,
    },
  });
});
