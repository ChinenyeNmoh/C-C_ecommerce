const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
const dotenv = require('dotenv');

dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/v2/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  console.log(profile);
  // try {
  //   const collection = dbClient.client.db().collection('users');
  //   const existingUser = await collection.findOne({ email: profile.emails[0].value });

  //   if (existingUser) {
  //     return done(null, existingUser);
  //   } else {
  //     // If the user doesn't exist, create a new user in your database
  //     const result = await collection.insertOne({ email: profile.emails[0].value });
  //     const newUser = { email: profile.emails[0].value, id: result.insertedId };
  //     return done(null, newUser);
  //   }
  // } catch (error) {
  //   return done(error);
  // }
  return done(null, profile);
}));

// Serialize and deserialize user methods for Passport.js
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
