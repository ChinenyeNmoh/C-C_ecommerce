const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productCategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String }
});

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;
