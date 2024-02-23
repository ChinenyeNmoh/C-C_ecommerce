const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    subTotalAfterCoupon: {
      type: Number,
    },
    shippingFee: {
      type: Number,
      default: 5000,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
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
