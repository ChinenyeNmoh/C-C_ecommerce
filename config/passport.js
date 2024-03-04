const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = require('../models/user');
const Token = require("../models/token");
const crypto = require("crypto");
const { sendEmail, emailVerificationTemplate } = require('../utils/email');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/user/google/callback',
      },
      async (accessToken, refreshToken, profile, email, done) => {
        console.log(email);
        const newUser = {
          "google.googleId": email.id,
          "google.firstname": email.name.givenName,
          "google.lastname": email.name.familyName,
          "google.email": email.emails[0].value,
        };

        try {
          let user = await User.findOne({ "google.googleId": email.id });
          let localUser = await User.findOne({ "local.email": email.emails[0].value });
          if (localUser && localUser.isBlocked) {
            return done(null, false, { message: 'Your account has been blocked. Make a complaint with the enquiry form below' });
          }

          if (user) {
            console.log('User found with Google ID');
            done(null, user);
          } else if (localUser) {
            // Update the existing local user with Google information
            const updatedGoogleUser = await User.findOneAndUpdate(
              { "local.email": email.emails[0].value },
              {
                $set: {
                  "google.googleId": email.id,
                  "google.firstname": email.name.givenName,
                  "google.lastname": email.name.familyName,
                  "google.email": email.emails[0].value,
                },
              },
              { new: true }
            );

            console.log('Local user updated with Google info');
            done(null, updatedGoogleUser);
          } else {
            user = await User.create(newUser);
            console.log('New user created with Google info');
            done(null, user);
          }
        } catch (err) {
          console.error('Error during Google authentication:', err);
          done(err, null);
        }
      }
    )
  );

  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    async function(req, email, password, done) {
      try {
        const user = await User.findOne({ "local.email": email });
  
        if (!user) {
          console.log('User not found during local authentication');
          return done(null, false, { message: 'User not found' });
        }
        const isMatched = await user.isPasswordMatched(password);
  
        if (!isMatched) {
          console.log('Password does not match during local authentication');
          return done(null, false, { message: 'Password does not match' });
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
          req.flash('success', "An Email was sent to your account. Verify your account to login");
          }
          req.flash('warning', 'Check your Email for Account Verification Link')
          return done(null, false);
        }
        if(user.isBlocked){
          req.flash("error", "Your account has been blocked. Make a complient with the enquiry form below")
          const previousUrl = req.headers.referer || '/';
          return res.redirect(previousUrl)
        }
        req.flash('success', "Login successful")
        console.log('Local authentication success:', `${user.firstname} has been logged in`);
        return done(null, user); // Only call done once, after successful authentication
      } catch (err) {
        console.error('Error during local authentication:', err);
        done(err, null);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      // Check if the id belongs to a User model
      const user = await User.findById(id);
      if (user) {
        console.log('User found during deserialization');
        return done(null, user);
      }  
      console.log('User not found during deserialization');
      return done(null, null);
    } catch (err) {
      console.error('Error during user deserialization:', err);
      return done(err, null);
    }
  });
};
