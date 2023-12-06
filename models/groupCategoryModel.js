const mongoose = require('mongoose');

const groupCategorySchema = mongoose.Schema(
  {
    name: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroupCategory', groupCategorySchema);
