const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const passport = require('./passport');
const dbClient = require('./utils/db');

dotenv.config();

const port = process.env.PORT || 5001;

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v2/', routes);

app.listen(port, () => {
  console.log('Server running on port', port);
});
