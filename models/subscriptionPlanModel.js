const mongoose = require('mongoose');

const subscriptionPlanSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    icon: {
      type: String,
    },
    price: {
      type: Number,
    },
    validity: {
      type: Number,
    },
    appointmentFeatures: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
