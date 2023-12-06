const mongoose = require("mongoose");
const moment = require("moment");
const AppError = require("../utils/appError");
const Subscription = require("../models/subscriptionModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const { charge } = require("../utils/stripe");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllSubscription = catchAsync(async (req, res, next) => {
  const filter = {};

  let query = [
    {
      $match: filter,
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
        from: "subscriptionplans",
        localField: "subscriptionPlanId",
        foreignField: "_id",
        as: "subscriptionPlanId",
      },
    },
    { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
    {
      $unwind: {
        path: "$subscriptionPlanId",
        preserveNullAndEmptyArrays: true,
      },
    },
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
        ],
      },
    });
  }

  query.push({ $count: "count" });
  const totalCount = await Subscription.aggregate(query);
  query.pop();

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query.push({ $skip: skip });
    query.push({ $limit: limit });
  }

  const subscriptions = await Subscription.aggregate(query);

  res.status(200).json({
    status: "success",
    total: totalCount && totalCount.length ? totalCount[0].count : 0,
    results: subscriptions.length,
    data: {
      subscriptions,
    },
  });
});

exports.getSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({ userId: req.user._id })
    .select("userId validTill")
    .populate("subscriptionPlanId", "name icon ")
    .lean();

  if (!subscription)
    return res
      .status(200)
      .json({ status: "success", message: "No Subscription found" });

  if (new Date() < new Date(subscription.validTill)) {
    subscription.status = "active";
  } else {
    subscription.status = "expired";
  }

  res.status(200).json({
    status: "success",
    data: {
      subscription,
    },
  });
});

exports.createSubscription = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id });
  const subscriptionPlan = await SubscriptionPlan.findOne({
    name: req.body.subscriptionType,
  });

  let subscription = null;
  if (req.body.type === "ios") {
    subscription = await Subscription.create({
      userId: user._id,
      subscriptionPlanId: subscriptionPlan._id,
      amount: subscriptionPlan.price,
      validTill: new Date(moment().add(subscriptionPlan.validity * 30, "days")),
      // transactionId: intent.id,
    });

    subscription.subscriptionPlanId = subscriptionPlan;

    res.status(201).json({
      status: "success",
      message: "Subscription successful",
      subscription,
    });
  } else if (req.body.type === "android") {
    const payment_method = req.body.paymentMethod;

    let existingSubscription = await Subscription.findOne({
      userId: req.user._id,
    });

    if (!existingSubscription) {
      const intent = await charge({
        receipt_email: user.email,
        amount: subscriptionPlan.price * 100,
        currency: "usd",
        payment_method: payment_method,
      });

      if (intent && intent.status === "succeeded") {
        subscription = await Subscription.create({
          userId: user._id,
          subscriptionPlanId: subscriptionPlan._id,
          amount: subscriptionPlan.price,
          validTill: new Date(
            moment().add(subscriptionPlan.validity * 30, "days")
          ),
          transactionId: intent.id,
        });

        subscription.subscriptionPlanId = subscriptionPlan;

        res.status(201).json({
          status: "success",
          message: "Payment successful",
          subscription,
        });
      } else {
        res.status(400).json({
          status: "fail",
          message: "Payment failed",
        });
      }
    } else {
      if (
        new Date() < new Date(existingSubscription.validTill) &&
        existingSubscription.subscriptionPlanId.toString() ===
          subscriptionPlan._id.toString()
      ) {
        return next(new AppError("Same Subscription Plan already active", 400));
      }

      const intent = await charge({
        receipt_email: user.email,
        amount: subscriptionPlan.price * 100,
        currency: "usd",
        payment_method: payment_method,
      });

      if (intent && intent.status === "succeeded") {
        subscription = await Subscription.findByIdAndUpdate(
          existingSubscription._id,
          {
            subscriptionPlanId: subscriptionPlan._id,
            amount: subscriptionPlan.price,
            validTill: new Date(
              moment().add(subscriptionPlan.validity * 30, "days")
            ),
            transactionId: intent.id,
          },
          {
            new: true,
            runValidators: true,
          }
        );

        subscription.subscriptionPlanId = subscriptionPlan;

        res.status(201).json({
          status: "success",
          message: "Payment successful",
          subscription,
        });
      } else {
        res.status(400).json({
          status: "fail",
          message: "Payment failed",
        });
      }
    }
  }
});

exports.createSubscriptionOld = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id });
  const subscriptionPlan = await SubscriptionPlan.findOne({
    _id: req.body.subscriptionPlanId,
  });
  const payment_method = req.body.paymentMethod;

  let existingSubscription = await Subscription.findOne({
    userId: req.user._id,
  });

  let subscription = null;
  if (!existingSubscription) {
    const intent = await charge({
      receipt_email: user.email,
      amount: subscriptionPlan.price * 100,
      currency: "usd",
      payment_method: payment_method,
    });

    if (intent && intent.status === "succeeded") {
      subscription = await Subscription.create({
        userId: user._id,
        subscriptionPlanId: subscriptionPlan._id,
        amount: subscriptionPlan.price,
        validTill: new Date(
          moment().add(subscriptionPlan.validity * 30, "days")
        ),
        transactionId: intent.id,
      });

      subscription.subscriptionPlanId = subscriptionPlan;

      res.status(201).json({
        status: "success",
        message: "Payment successful",
        subscription,
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: "Payment failed",
      });
    }
  } else {
    if (
      new Date() < new Date(existingSubscription.validTill) &&
      existingSubscription.subscriptionPlanId.toString() ===
        req.body.subscriptionPlanId.toString()
    ) {
      return next(new AppError("Same Subscription Plan already active", 400));
    }

    const intent = await charge({
      receipt_email: user.email,
      amount: subscriptionPlan.price * 100,
      currency: "usd",
      payment_method: payment_method,
    });

    if (intent && intent.status === "succeeded") {
      subscription = await Subscription.findByIdAndUpdate(
        existingSubscription._id,
        {
          subscriptionPlanId: subscriptionPlan._id,
          amount: subscriptionPlan.price,
          validTill: new Date(
            moment().add(subscriptionPlan.validity * 30, "days")
          ),
          transactionId: intent.id,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      subscription.subscriptionPlanId = subscriptionPlan;

      res.status(201).json({
        status: "success",
        message: "Payment successful",
        subscription,
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: "Payment failed",
      });
    }
  }
});
