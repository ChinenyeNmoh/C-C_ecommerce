const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'The {PATH} must be at least {MINLENGTH} characters.'],
    maxlength: [50, 'The {PATH} must be at most {MAXLENGTH} characters.'],
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'The {PATH} must be at least {MINLENGTH} characters.'],
    maxlength: [50, 'The {PATH} must be at most {MAXLENGTH} characters.'],
  },
  street: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'The {PATH} must be at least {MINLENGTH} characters.'],
    maxlength: [100, 'The {PATH} must be at most {MAXLENGTH} characters.'],
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    minlength: [10, 'The {PATH} must be at least {MINLENGTH} characters.'],
    maxlength: [100, 'The {PATH} must be at most {MAXLENGTH} characters.'],
  },
  recipientPhoneNo: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{11}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid 11-digit mobile number!`,
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model("Address", addressSchema);
