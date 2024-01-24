const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true }
});

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  addresses: [addressSchema],
  reviews: [{ type: Schema.Types.ObjectId, ref: 'UserReview' }],
  paymentMethods: [{ type: Schema.Types.ObjectId, ref: 'PaymentMethod' }],
  shoppingCart: { type: Schema.Types.ObjectId, ref: 'ShoppingCart' },
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
});

userSchema.path('addresses').validate(function (value) {
  return value.length >= 1 && value.length <= 3;
}, 'User must have at least 1 and at most 3 addresses');

const User = mongoose.model('User', userSchema);

module.exports = User;
