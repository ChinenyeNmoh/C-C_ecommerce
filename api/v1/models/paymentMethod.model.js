const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentMethodSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cardNumber: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  cvv: { type: String, required: true }
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;
