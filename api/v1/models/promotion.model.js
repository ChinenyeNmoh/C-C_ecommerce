const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promotionSchema = new Schema({
  name: { type: String, required: true },
  discountPercentage: { type: Number, required: true }
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
