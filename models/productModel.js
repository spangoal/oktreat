const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    images: [String],
    price: {
      type: Number,
    },
    description: {
      type: String,
    },
    stock: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

productSchema.plugin(autoIncrement.plugin, {
  model: "Product",
  field: "customId",
  startAt: 1,
});

module.exports = mongoose.model("Product", productSchema);
