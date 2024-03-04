const mongoose = require("mongoose"); // Erase if already required
const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model
const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1
        },
        price: Number,
      },
    ],
    cartTotal: Number,
    totalAfterDiscount: Number,
    orderedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Cart", cartSchema);