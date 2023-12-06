const mongoose = require("mongoose");
const User = require('./userModel');

const ratingSchema = mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Appointment",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

ratingSchema.statics.calcAverageRatings = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { userId: userId }
    },
    {
      $group: {
        _id: '$userId',
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(userId, {
      coachRating: stats[0].avgRating
    });
  }
};

ratingSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.userId);
});

ratingSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.userId);
});

module.exports = mongoose.model("Rating", ratingSchema);
