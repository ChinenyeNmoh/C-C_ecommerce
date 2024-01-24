const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  variations: [{ type: Schema.Types.ObjectId, ref: 'ProductVariation' }],
  promotions: [{ type: Schema.Types.ObjectId, ref: 'Promotion' }]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
