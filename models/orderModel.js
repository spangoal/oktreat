const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        price: Number,
      },
    ],
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      country: String,
      zipcode: String,
      landmark: String,
    },
    totalPrice: Number,
    grandTotalPrice: Number,
    discount: {
      amount: Number,
      percentage: Number,
      discountType: String,
    },
    transactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["recieved", "shipped", "out for delivery", "delivered"],
      default: "recieved",
    },
  },
  { timestamps: true }
);

orderSchema.plugin(autoIncrement.plugin, {
  model: "Order",
  field: "customId",
  startAt: 1,
});

module.exports = mongoose.model("Order", orderSchema);
