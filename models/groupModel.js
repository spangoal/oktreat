const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
  {
    icon: { type: String },
    groupCategoryId: {
      type: mongoose.Schema.ObjectId,
      ref: 'GroupCategory',
    },
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    udid: { type: String },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
