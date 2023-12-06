const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    title: String,
    description: String,
    icon: String,
    isRead: { type: Boolean, default: false },
    notificationType: {
      type: String,
      enum: ["appointment_status"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
