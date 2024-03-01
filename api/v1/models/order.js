const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    subTotal: {
      type: Number,
    },
    subTotalAfterCoupon: {
      type: Number,
    },
    shippingFee: {
      type: Number,
      default: 5000,
    },
    totalPrice: {
      type: Number
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],
    paidAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash on delivery", "card"],
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["ordered", "delivered"],
      default: "ordered",
    },
    deliveredAt: {
      type: Date,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
