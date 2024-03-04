const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
