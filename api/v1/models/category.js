const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productCategorySchema = new Schema({
  title: { 
    type: String, 
    required: true,
    unique: true
  },
  description: { 
    type: String
  }
}, {
  timestamps: true
});

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;