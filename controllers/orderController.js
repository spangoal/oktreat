const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const { charge } = require("../utils/stripe");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllOrder = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.user.role === "user") {
    filter.userId = new ObjectId(req.user._id);
  }

  let query = Order.find(filter)
    .sort("-createdAt")
    .populate("products.productId", "name images description");

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const orders = await query;
  const totalCount = await Order.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.getAllOrderAdmin = catchAsync(async (req, res, next) => {
  const filter = {};

  let query = [
    {
      $match: filter,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productsCart",
      },
    },
    { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
  ];

  if (req.query.search) {
    query.push({
      $match: {
        $or: [
          {
            "userId.name": {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            "userId.email": {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            "userId.phone": {
              $regex: req.query.search,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  query.push({ $count: "count" });
  const totalCount = await Order.aggregate(query);
  query.pop();

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query.push({ $skip: skip });
    query.push({ $limit: limit });
  }

  const orders = await Order.aggregate(query);

  res.status(200).json({
    status: "success",
    total: totalCount && totalCount.length ? totalCount[0].count : 0,
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  req.body.userId = req.user._id;

  if (req.body.products && !req.body.products.length)
    return next(new AppError("Please add products to buy.", 400));

  for (let product of req.body.products) {
    let productInStock = await Product.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });

    if (!productInStock)
      return next(new AppError("One or More Product out of stock.", 400));
  }

  const intent = await charge({
    receipt_email: req.user.email,
    amount: req.body.grandTotalPrice * 100,
    currency: "usd",
    payment_method: req.body.payment_method,
  });

  if (intent && intent.status === "succeeded") {
    req.body.transactionId = intent.id;
    await Order.create(req.body);

    for (let product of req.body.products) {
      await Product.updateOne(
        { _id: product.productId },
        { $inc: { stock: -product.quantity } }
      );
    }

    res.status(201).json({
      status: "success",
      message: "Order successful",
    });
  } else {
    res.status(400).json({
      status: "fail",
      message: "Payment failed",
    });
  }
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  let order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!order) return next(new AppError("No order found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Order updated successfully",
    data: { order },
  });
});
