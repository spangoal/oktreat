const mongoose = require('mongoose');

const timeSlotSchema = mongoose.Schema(
  {
    coachID: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    date: {
      type: String,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    appointmentType: {
      type: String,
      enum: ['chat', 'video'],
    },
    appointmentLink: {
      type: String,
    },
    isBooked: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('timeSlot', timeSlotSchema);
