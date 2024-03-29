const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productTypeSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    unique: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductType', productTypeSchema);