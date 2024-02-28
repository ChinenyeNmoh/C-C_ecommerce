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
      return res.status(403).json({ message: 'You need to login first' });
    }
  },  

  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      console.log('User is not authenticated')
      return next();
    } else {
      return res.status(400).json({
        message: "you are already logged in. you need to be a guest"
        
      })
    }
  },

  // Handle admin
  ensureAdmin: function(req, res, next) {
    const role = req.user.role;
    console.log(role)
    if (role === "admin") {
      console.log("Welcome admin");
      return next();
    } else {
      console.log("You are not an admin");
      return res.status(403).json({ message: "You are not an admin" });
    }
  },

  // Function to check if a string is a valid MongoDB ObjectId
  validateId: (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid ObjectId',
      });
    }
    console.log("Object id is valid")
    // If the ID is valid, continue to the next middleware or route handler
    next();
  },

 // validate login
validateLogin: async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    if (!email || !password || email.trim().length === 0 || password.trim().length === 0) {
      return res.status(400).json({ message: "Email and password fields cannot be empty" });
    }

    const user = await User.findOne({ "local.email": email });

    if (!user) {
      return res.status(404).json({ message: 'User with email not found' });
    }

    const isMatched = await user.isPasswordMatched(password);

    if (!isMatched) {
      return res.status(403).json({ message: 'Password does not match' });
    }

    if (!user.isVerified) {
      const userToken = await Token.findOne({userId: user._id})
      console.log(userToken)
      if(!userToken){
        const token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save()
        // Construct the verification URL
      const link = `${process.env.BASE_URL}/${user.id}/verify/${token.token}`;
      const htmlContent = emailVerificationTemplate(link);
      // Send the verification email
      await sendEmail(user.local.email, 'Verify Email', htmlContent); 
      }
      return res.status(400).json({ 
        message: "An Email was sent to your account.Verify your account to login" 
      });
    }
    // If email and password match, and the account is verified, call next to proceed
    next();
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' });
  }
}

}
