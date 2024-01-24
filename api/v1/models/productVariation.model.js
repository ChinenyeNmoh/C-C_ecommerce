const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productVariationSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const ProductVariation = mongoose.model('ProductVariation', productVariationSchema);

module.exports = ProductVariation;
