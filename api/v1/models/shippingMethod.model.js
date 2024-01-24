const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shippingMethodSchema = new Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true }
});

const ShippingMethod = mongoose.model('ShippingMethod', shippingMethodSchema);

module.exports = ShippingMethod;
