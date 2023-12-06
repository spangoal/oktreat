const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    coachId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    timeSlotId: {
      type: mongoose.Schema.ObjectId,
      ref: 'timeSlot',
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'confirmed', 'cancelled'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
