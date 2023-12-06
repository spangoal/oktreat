const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    subscriptionPlanId: {
      type: mongoose.Schema.ObjectId,
      ref: 'SubscriptionPlan',
    },
    amount: {
      type: Number,
    },
    validTill: {
      type: Date,
    },
    transactionId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
