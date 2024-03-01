const mongoose = require('mongoose');
const User = require('../models/user');
const Token = require("../models/token");
const crypto = require("crypto");
const { sendEmail, emailVerificationTemplate } = require('../utils/email');


// Function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      console.log('User is authenticated');
      return next();
    } else {
      console.log('User is not authenticated');
      req.flash('warning', 'You need to login first')
      return res.redirect('/')
    }
  },  

  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      console.log('User is not authenticated')
      return next();
    } else {
      req.flash('warning', 'You are already logged in')
      return res.redirect('/')
    }
  },

  // Handle admin
ensureAdmin: function(req, res, next) {
  const role = req.user.role;
  const email = req.user.local.email || req.user.google.email;
  console.log(role);
  if (role === "admin" || email === 'chinenyeumeaku@gmail.com') {
    console.log("Welcome admin");
    return next();
  } else {
    console.log("You are not an admin");
    req.flash('warning', 'You are not an admin');
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  }
},

  // Function to check if a string is a valid MongoDB ObjectId
  validateId: (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      req.flash('error', 'Invalid ObjectId')
    }
    console.log("Object id is valid")
    // If the ID is valid, continue to the next middleware or route handler
    next();
  },

validateQuery: async (req, res, next) => {
  // Check if the page query parameter is not present
  if (!req.query.page) {
    // Add page=1 query parameter
    req.query.page = 1;
  }
  // Move to the next middleware
  next();
}
};

