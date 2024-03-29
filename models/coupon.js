const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  expireAt: { 
    type: Date,
    expires: '2d', // Expires after 2 day
    index: true, 
    default: Date.now,
},
  discount: {
    type: Number,
    required: true,
  },
});

//Export the model
module.exports = mongoose.model("Coupon", couponSchema);