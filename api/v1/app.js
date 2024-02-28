const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const authRouter = require('./routes/authRouter');
const productRouter = require('./routes/productRouter');
const categoryRouter = require('./routes/categoryRouter');
const couponRouter = require('./routes/couponRouter');
const addressRouter = require('./routes/addressRouter');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter');
const uploadRouter = require('./routes/uploadRouter');
const enquiryRouter = require('./routes/enquiryRouter');
const typeRouter = require('./routes/productTypeRouter');
const dbConnect = require('./config/db');

const app = express();

// Load config. always make sure you load it first
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);
require('./utils/email');

dbConnect();
// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
  session({
    name: 'chinenye',
    secret: 'keyboard word',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60000 * 60 * 24
    },
    // creates session in the database with cookie
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// route handlers
app.use('/api/v1/user', authRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/coupon', couponRouter);
app.use('/api/v1/address', addressRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/image', uploadRouter);
app.use('/api/v1/enquiry', enquiryRouter);
app.use('/api/v1/type', typeRouter);

// Logging using morgan middleware only if we are in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
