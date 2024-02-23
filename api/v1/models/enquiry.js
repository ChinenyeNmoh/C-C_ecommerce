const mongoose = require("mongoose"); 


const emailValidator = function (value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };
  
  // Custom validator function for name length
  const nameLengthValidator = function (value) {
    return value.length >= 3;
  };

// Declare the Schema of the Mongo model
var enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
        validator: nameLengthValidator,
        message: 'Name must be at least 3 characters long',
      },
  },
  email: {
    type: String,
    required: true,
    validate: {
        validator: emailValidator,
        message: 'Invalid email format',
      },
  },
  phoneNo: {
    type: String,
    required: true,
    validate: {
        validator: function (v) {
          return /^\d{11}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 11-digit mobile number!`,
      },
  },
  comment: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Submitted",
    enum: ["Submitted", "Contacted", "In Progress", "Resolved"],
  },
});

//Export the model
module.exports = mongoose.model("Enquiry", enquirySchema);