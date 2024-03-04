const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    discountedPrice: {
      type: Number,
      default: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Category',
      required: false
    },
    productType: {
      type: mongoose.Schema.Types.ObjectId, ref: 'ProductType',
      required: false
    },
    quantity: {
      type: Number,
      min: 0
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: String,
      },
    ],
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);