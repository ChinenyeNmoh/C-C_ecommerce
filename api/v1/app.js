const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

mongoose.connect('mongodb://localhost/ecommerce')
  .then(() => console.log('MongoDB connection established successfully'))
  .then(() => app.listen(3000, () => {
    console.log('server started on port 3000');
  }))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  // jwt.sign({ userId: 'hello' }, 'hello', { expiresIn: '1h' });
  res.send('hello');
});
