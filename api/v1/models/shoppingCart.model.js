const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shoppingCartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ]
});

const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

module.exports = ShoppingCart;
