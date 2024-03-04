const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Token = require('../models/token')
const Schema = mongoose.Schema;

// Custom validator function for email
const emailValidator = function (value) {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

// Custom validator function for name length
const nameLengthValidator = function (value) {
  return value.length >= 3;
};

const userSchema = new mongoose.Schema(
  {
    local: {
      firstname: {
        type: String,
        validate: {
          validator: nameLengthValidator,
          message: 'Name must be at least 3 characters long',
        },
      },
      lastname: {
        type: String,
        validate: {
          validator: nameLengthValidator,
          message: 'Name must be at least 3 characters long',
        },
      },
      email: {
        type: String,
        unique: true,
        validate: {
          validator: emailValidator,
          message: 'Invalid email format',
        },
      },
      mobile: {
        type: String,
        unique: true,
        validate: {
          validator: function (v) {
            return /^\d{11}$/.test(v);
          },
          message: (props) =>
            `${props.value} is not a valid 11-digit mobile number!`,
        },
      },
      password: {
        type: String,
      },
      confirm_password: {
        type: String,
        validate: {
          validator: function (value) {
            return value === this.local.password;
          },
          message: 'Passwords do not match',
        },
      },
    },
    google: {
      googleId: String,
      email: String,
      firstname: String,
      lastname: String,
    },
    role: {
      type: String,
      default: 'user',
    },
    address: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPasswordModified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  try {
    // Check if the local password field is present and not empty
    if (this.local && this.local.password) {
      // Generate a salt for password hashing
      const salt = await bcrypt.genSalt(10);

      // Hash the password with the generated salt
      this.local.password = await bcrypt.hash(this.local.password, salt);

      // Check if confirm_password is present before hashing
      if (this.local.confirm_password) {
        this.local.confirm_password = await bcrypt.hash(this.local.confirm_password, salt);
      }

      // Continue with the save operation
      next();
    } else {
      // If password is missing or empty, proceed without hashing
      next();
    }
  } catch (error) {
    // Handle any errors that occurred during password hashing
    next(error);
  }
});

// Instance method to check if the entered password matches the stored hashed password
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  try {
    // Use bcrypt.compare to compare the entered password with the stored hashed password
    return await bcrypt.compare(enteredPassword, this.local.password);
  } catch (error) {
    // Handle any errors that occurred during password comparison
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);
